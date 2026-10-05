from datetime import datetime, timedelta, timezone
import unittest

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import main
import models
import security


class SightingDeletionTest(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
        models.Base.metadata.create_all(self.engine)
        self.db = sessionmaker(bind=self.engine)()
        self.db.add(models.Nivel(nivel=1, titulo="Novato", puntos_requeridos=0))
        self.owner = models.Usuario(username="owner", email="owner@example.com", password="unused", puntos_totales=10)
        self.other = models.Usuario(username="other", email="other@example.com", password="unused", puntos_totales=6)
        self.db.add_all([self.owner, self.other])
        self.db.flush()
        now = datetime.now(timezone.utc)
        self.animal = models.Animal(id_descubridor=self.owner.id_usuario, especie="Perro", color_principal="golden",
            fecha_primer_avistamiento=now, fecha_ultimo_avistamiento=now, ultima_latitud=1, ultima_longitud=2)
        self.db.add(self.animal)
        self.db.flush()
        self.sighting = models.Avistamiento(id_animal=self.animal.id_animal, id_usuario=self.owner.id_usuario,
            latitud=1, longitud=2, descripcion="test", fecha_creacion=now)
        self.db.add(self.sighting)
        self.db.commit()
        self.url = f"/avistamientos/{self.sighting.id_avistamiento}"
        main.app.dependency_overrides[main.get_db] = lambda: self.db
        self.client = TestClient(main.app)

    def tearDown(self):
        self.client.close()
        main.app.dependency_overrides.clear()
        self.db.close()
        self.engine.dispose()

    def auth(self, user):
        return {"Authorization": "Bearer " + security.crear_token_acceso({"sub": user.email})}

    def test_requires_login_and_rejects_another_user(self):
        self.assertEqual(self.client.delete(self.url).status_code, 401)
        self.assertEqual(self.client.delete(self.url, headers=self.auth(self.other)).status_code, 403)
        self.assertEqual(self.db.query(models.Avistamiento).count(), 1)
        self.assertEqual(self.owner.puntos_totales, 10)

    def test_last_sighting_removes_empty_animal_and_confirmations(self):
        self.db.add(models.Confirmacion(id_usuario=self.other.id_usuario, id_avistamiento=self.sighting.id_avistamiento))
        self.db.commit()
        response = self.client.delete(self.url, headers=self.auth(self.owner))
        self.assertEqual(response.status_code, 200, response.text)
        self.assertTrue(response.json()["animal_eliminado"])
        self.assertEqual(self.db.query(models.Animal).count(), 0)
        self.assertEqual(self.db.query(models.Confirmacion).count(), 0)
        self.assertEqual(self.owner.puntos_totales, 5)
        self.assertEqual(self.other.puntos_totales, 5)
        self.assertEqual(self.client.delete(self.url, headers=self.auth(self.owner)).status_code, 404)

    def test_preserves_other_users_sighting_and_recalculates_map(self):
        earlier = self.sighting.fecha_creacion - timedelta(days=1)
        remaining = models.Avistamiento(id_animal=self.animal.id_animal, id_usuario=self.other.id_usuario,
            latitud=3, longitud=4, descripcion="other", fecha_creacion=earlier)
        self.db.add(remaining)
        self.db.commit()
        # Discovering the animal does not grant deletion rights over another author's sighting.
        self.assertEqual(self.client.delete(f"/avistamientos/{remaining.id_avistamiento}", headers=self.auth(self.owner)).status_code, 403)
        response = self.client.delete(self.url, headers=self.auth(self.owner))
        self.assertFalse(response.json()["animal_eliminado"])
        self.assertEqual(self.db.query(models.Avistamiento).count(), 1)
        self.db.refresh(self.animal)
        self.assertEqual((self.animal.total_avistamientos, self.animal.ultima_latitud, self.animal.ultima_longitud), (1, 3, 4))
        self.assertEqual(self.animal.fecha_primer_avistamiento, self.animal.fecha_ultimo_avistamiento)

    def test_my_sightings_are_private_and_filtered(self):
        self.assertEqual(self.client.get("/usuarios/me/avistamientos").status_code, 401)
        own = self.client.get("/usuarios/me/avistamientos", headers=self.auth(self.owner))
        self.assertEqual([row["id_avistamiento"] for row in own.json()], [str(self.sighting.id_avistamiento)])
        self.assertEqual(self.client.get("/usuarios/me/avistamientos", headers=self.auth(self.other)).json(), [])
