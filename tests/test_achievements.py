from datetime import datetime, timezone
import os
import sys
import types
import unittest
import json
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("SECRET_KEY", "test-secret-key-that-is-long-enough")
sys.modules.setdefault("dotenv", types.SimpleNamespace(load_dotenv=lambda *args, **kwargs: None))

from achievements import BREEDS, evaluate_user_achievements
import models


class AchievementEngineTest(unittest.TestCase):
    def test_frontend_codex_aliases_match_backend_achievements(self):
        aliases_path = Path(__file__).resolve().parents[1] / "frontend/src/data/breedAliases.json"
        aliases = json.loads(aliases_path.read_text(encoding="utf-8"))
        self.assertEqual(aliases, {breed["id"]: breed["aliases"] for breed in BREEDS})

    def setUp(self):
        self.engine = create_engine("sqlite:///:memory:")
        models.Base.metadata.create_all(bind=self.engine)
        self.Session = sessionmaker(bind=self.engine)
        self.db = self.Session()
        self.db.add(models.Nivel(nivel=1, titulo="Novato", puntos_requeridos=0))
        self.user = models.Usuario(
            username="laura",
            email="laura@example.com",
            password="hashed",
            nivel_actual=1,
        )
        self.db.add(self.user)
        self.db.flush()

    def tearDown(self):
        self.db.close()
        models.Base.metadata.drop_all(bind=self.engine)
        self.engine.dispose()

    def add_animal_with_sightings(self, species, text, count=1, created_at=None):
        created_at = created_at or datetime(2026, 7, 1, tzinfo=timezone.utc)
        animal = models.Animal(
            id_descubridor=self.user.id_usuario,
            especie=species,
            color_principal=text,
            fecha_primer_avistamiento=created_at,
            fecha_ultimo_avistamiento=created_at,
            total_avistamientos=count,
            ultima_latitud=4.711,
            ultima_longitud=-74.072,
        )
        self.db.add(animal)
        self.db.flush()
        for _ in range(count):
            self.db.add(models.Avistamiento(
                id_animal=animal.id_animal,
                id_usuario=self.user.id_usuario,
                latitud=4.711,
                longitud=-74.072,
                descripcion=text,
                fecha_creacion=created_at,
            ))
        self.db.flush()
        return animal

    def achievement_by_id(self, achievements, achievement_id):
        return next(item for item in achievements if item["clave"] == achievement_id)

    def test_unlocks_husky_achievement_with_typo_alias_once(self):
        self.add_animal_with_sightings(models.EspeciePermitida.PERRO, "jusky", count=3)

        first_pass = evaluate_user_achievements(self.user, self.db)
        pack_caller = self.achievement_by_id(first_pass, "three_huskies")

        self.assertTrue(pack_caller["completado"])
        self.assertEqual(pack_caller["progreso"], 3)
        points_after_first_pass = self.user.puntos_logros
        self.assertGreaterEqual(points_after_first_pass, 5)

        second_pass = evaluate_user_achievements(self.user, self.db)

        self.assertTrue(self.achievement_by_id(second_pass, "three_huskies")["completado"])
        self.assertEqual(self.user.puntos_logros, points_after_first_pass)

    def test_locked_hidden_achievements_do_not_reveal_title_or_description(self):
        achievements = evaluate_user_achievements(self.user, self.db)
        hidden = self.achievement_by_id(achievements, "lucky_encounter")

        self.assertFalse(hidden["completado"])
        self.assertTrue(hidden["oculto"])
        self.assertEqual(hidden["titulo"], "???")
        self.assertEqual(hidden["descripcion"], "Logro oculto")

    def test_completed_hidden_achievement_reveals_content_and_awards_patitas(self):
        self.add_animal_with_sightings(models.EspeciePermitida.GATO, "Bengali", count=1)

        achievements = evaluate_user_achievements(self.user, self.db)
        hidden = self.achievement_by_id(achievements, "lucky_encounter")

        self.assertTrue(hidden["completado"])
        self.assertEqual(hidden["titulo"], "Encuentro afortunado")
        self.assertEqual(hidden["patitas"], 100)
        self.assertGreaterEqual(self.user.puntos_logros, 100)


if __name__ == "__main__":
    unittest.main()
