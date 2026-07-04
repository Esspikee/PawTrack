from __future__ import annotations

from collections import Counter, defaultdict
from datetime import datetime, timezone
import re
import unicodedata

from sqlalchemy.orm import Session, joinedload

import models


ACHIEVEMENT_CATEGORIES = [
    {"id": "exploration", "label": "Exploracion", "icon": "mapPin"},
    {"id": "dog_breeds", "label": "Razas de perros", "icon": "paw"},
    {"id": "cat_breeds", "label": "Razas de gatos", "icon": "paw"},
    {"id": "collection", "label": "Coleccion", "icon": "book"},
    {"id": "daily_activity", "label": "Actividad diaria", "icon": "calendar"},
    {"id": "milestones", "label": "Hitos", "icon": "star"},
    {"id": "hidden", "label": "Ocultos", "icon": "lock"},
    {"id": "legendary", "label": "Legendarios", "icon": "trophy"},
]

ACHIEVEMENT_RARITIES = {
    "common": {"label": "Comun"},
    "uncommon": {"label": "Poco comun"},
    "rare": {"label": "Raro"},
    "epic": {"label": "Epico"},
    "legendary": {"label": "Legendario"},
}

DOG_BREEDS = [
    {"id": "criollo-dog", "name": "Criollo", "species": models.EspeciePermitida.PERRO, "aliases": ["criollo", "mestizo"]},
    {"id": "labrador", "name": "Labrador", "species": models.EspeciePermitida.PERRO, "aliases": ["labrador"]},
    {"id": "husky", "name": "Husky", "species": models.EspeciePermitida.PERRO, "aliases": ["husky", "huskie", "huskies", "huski", "haski", "hasky", "juski", "jusky", "juzki", "siberiano", "siberian"]},
    {"id": "yorkshire", "name": "Yorkshire", "species": models.EspeciePermitida.PERRO, "aliases": ["yorkshire", "yorkie"]},
    {"id": "golden", "name": "Golden", "species": models.EspeciePermitida.PERRO, "aliases": ["golden", "golden retriever"]},
    {"id": "shih-tzu", "name": "Shih Tzu", "species": models.EspeciePermitida.PERRO, "aliases": ["shih tzu", "shihtzu", "shitzu"]},
    {"id": "pug", "name": "Pug", "species": models.EspeciePermitida.PERRO, "aliases": ["pug", "carlino"]},
    {"id": "schnauzer", "name": "Schnauzer", "species": models.EspeciePermitida.PERRO, "aliases": ["schnauzer"]},
    {"id": "chihuahua", "name": "Chihuahua", "species": models.EspeciePermitida.PERRO, "aliases": ["chihuahua"]},
    {"id": "pastor-aleman", "name": "Pastor Aleman", "species": models.EspeciePermitida.PERRO, "aliases": ["pastor aleman", "pastor alemán", "german shepherd"]},
    {"id": "pitbull", "name": "Pitbull", "species": models.EspeciePermitida.PERRO, "aliases": ["pitbull", "pit bull"]},
]

CAT_BREEDS = [
    {"id": "criollo-cat", "name": "Criollo", "species": models.EspeciePermitida.GATO, "aliases": ["criollo", "mestizo"]},
    {"id": "persa", "name": "Persa", "species": models.EspeciePermitida.GATO, "aliases": ["persa", "persian"]},
    {"id": "negro", "name": "Negro", "species": models.EspeciePermitida.GATO, "aliases": ["negro", "black"]},
    {"id": "siames", "name": "Siames", "species": models.EspeciePermitida.GATO, "aliases": ["siames", "siamés", "siamese"]},
    {"id": "bengali", "name": "Bengali", "species": models.EspeciePermitida.GATO, "aliases": ["bengali", "bengal"]},
    {"id": "himalayo", "name": "Himalayo", "species": models.EspeciePermitida.GATO, "aliases": ["himalayo", "himalayan"]},
    {"id": "maine-coon", "name": "Maine Coon", "species": models.EspeciePermitida.GATO, "aliases": ["maine coon", "mainecoon"]},
    {"id": "ragdoll", "name": "Ragdoll", "species": models.EspeciePermitida.GATO, "aliases": ["ragdoll"]},
    {"id": "esfinge", "name": "Esfinge", "species": models.EspeciePermitida.GATO, "aliases": ["esfinge", "sphynx"]},
    {"id": "britanico", "name": "Britanico", "species": models.EspeciePermitida.GATO, "aliases": ["britanico", "británico", "british"]},
    {"id": "ruso-azul", "name": "Ruso Azul", "species": models.EspeciePermitida.GATO, "aliases": ["ruso azul", "azul ruso", "russian blue"]},
]

BREEDS = DOG_BREEDS + CAT_BREEDS
RARE_BREED_IDS = {"bengali", "himalayo", "maine-coon", "ragdoll", "esfinge", "ruso-azul"}


ACHIEVEMENT_DEFINITIONS = [
    {"id": "first_steps", "title": "Primeros pasos", "description": "Registra tu primera mascota.", "category": "exploration", "rarity": "common", "pawPrintReward": 5, "target": 1, "hidden": False, "metric": "total_sightings"},
    {"id": "explorer_i", "title": "Explorador I", "description": "Registra 25 avistamientos totales.", "category": "exploration", "rarity": "common", "pawPrintReward": 10, "target": 25, "hidden": False, "metric": "total_sightings"},
    {"id": "explorer_ii", "title": "Explorador II", "description": "Registra 100 avistamientos totales.", "category": "exploration", "rarity": "uncommon", "pawPrintReward": 25, "target": 100, "hidden": False, "metric": "total_sightings"},
    {"id": "explorer_iii", "title": "Explorador III", "description": "Registra 500 avistamientos totales.", "category": "exploration", "rarity": "epic", "pawPrintReward": 100, "target": 500, "hidden": False, "metric": "total_sightings"},
    {"id": "three_huskies", "title": "Llamado de manada I", "description": "Registra 3 huskies.", "category": "dog_breeds", "rarity": "common", "pawPrintReward": 5, "target": 3, "hidden": False, "metric": "husky_sightings"},
    {"id": "pack_caller_ii", "title": "Llamado de manada II", "description": "Registra 10 huskies.", "category": "dog_breeds", "rarity": "common", "pawPrintReward": 10, "target": 10, "hidden": False, "metric": "husky_sightings"},
    {"id": "pack_caller_iii", "title": "Llamado de manada III", "description": "Registra 25 huskies.", "category": "dog_breeds", "rarity": "rare", "pawPrintReward": 25, "target": 25, "hidden": False, "metric": "husky_sightings"},
    {"id": "pack_caller_iv", "title": "Llamado de manada IV", "description": "Registra 50 huskies.", "category": "dog_breeds", "rarity": "epic", "pawPrintReward": 50, "target": 50, "hidden": False, "metric": "husky_sightings"},
    {"id": "pack_caller_v", "title": "Llamado de manada V", "description": "Registra 100 huskies.", "category": "dog_breeds", "rarity": "legendary", "pawPrintReward": 100, "target": 100, "hidden": False, "metric": "husky_sightings"},
    {"id": "dog_enthusiast_i", "title": "Entusiasta canino I", "description": "Descubre 3 razas unicas de perro.", "category": "dog_breeds", "rarity": "common", "pawPrintReward": 10, "target": 3, "hidden": False, "metric": "unique_dog_breeds"},
    {"id": "dog_enthusiast_ii", "title": "Entusiasta canino II", "description": "Descubre 5 razas unicas de perro.", "category": "dog_breeds", "rarity": "uncommon", "pawPrintReward": 20, "target": 5, "hidden": False, "metric": "unique_dog_breeds"},
    {"id": "dog_enthusiast_iii", "title": "Entusiasta canino III", "description": "Descubre todas las razas de perro.", "category": "dog_breeds", "rarity": "legendary", "pawPrintReward": 100, "target": len(DOG_BREEDS), "hidden": False, "metric": "unique_dog_breeds"},
    {"id": "cat_enthusiast_i", "title": "Entusiasta felino I", "description": "Descubre 3 razas unicas de gato.", "category": "cat_breeds", "rarity": "common", "pawPrintReward": 10, "target": 3, "hidden": False, "metric": "unique_cat_breeds"},
    {"id": "cat_enthusiast_ii", "title": "Entusiasta felino II", "description": "Descubre 5 razas unicas de gato.", "category": "cat_breeds", "rarity": "uncommon", "pawPrintReward": 20, "target": 5, "hidden": False, "metric": "unique_cat_breeds"},
    {"id": "cat_enthusiast_iii", "title": "Entusiasta felino III", "description": "Descubre todas las razas de gato.", "category": "cat_breeds", "rarity": "legendary", "pawPrintReward": 100, "target": len(CAT_BREEDS), "hidden": False, "metric": "unique_cat_breeds"},
    {"id": "new_discovery", "title": "Nuevo descubrimiento", "description": "Descubre una raza por primera vez.", "category": "collection", "rarity": "common", "pawPrintReward": 15, "target": 1, "hidden": False, "metric": "unique_total_breeds"},
    {"id": "collector_i", "title": "Coleccionista I", "description": "Descubre 5 razas totales.", "category": "collection", "rarity": "common", "pawPrintReward": 20, "target": 5, "hidden": False, "metric": "unique_total_breeds"},
    {"id": "collector_ii", "title": "Coleccionista II", "description": "Descubre 10 razas totales.", "category": "collection", "rarity": "rare", "pawPrintReward": 50, "target": 10, "hidden": False, "metric": "unique_total_breeds"},
    {"id": "master_collector", "title": "Coleccionista maestro", "description": "Completa todo el Bestiario.", "category": "collection", "rarity": "legendary", "pawPrintReward": 250, "target": len(BREEDS), "hidden": False, "metric": "unique_total_breeds"},
    {"id": "daily_explorer", "title": "Explorador diario", "description": "Registra avistamientos durante 3 dias consecutivos.", "category": "daily_activity", "rarity": "common", "pawPrintReward": 10, "target": 3, "hidden": False, "metric": "max_daily_streak"},
    {"id": "field_researcher", "title": "Investigador de campo", "description": "Registra avistamientos durante 7 dias consecutivos.", "category": "daily_activity", "rarity": "rare", "pawPrintReward": 25, "target": 7, "hidden": False, "metric": "max_daily_streak"},
    {"id": "wildlife_expert", "title": "Experto en fauna", "description": "Registra avistamientos durante 30 dias consecutivos.", "category": "daily_activity", "rarity": "epic", "pawPrintReward": 100, "target": 30, "hidden": False, "metric": "max_daily_streak"},
    {"id": "master_naturalist", "title": "Naturalista maestro", "description": "Registra avistamientos durante 100 dias consecutivos.", "category": "daily_activity", "rarity": "legendary", "pawPrintReward": 500, "target": 100, "hidden": False, "metric": "max_daily_streak"},
    {"id": "dog_lover", "title": "Amante de perros", "description": "Registra 100 perros.", "category": "milestones", "rarity": "rare", "pawPrintReward": 50, "target": 100, "hidden": False, "metric": "dog_sightings"},
    {"id": "cat_lover", "title": "Amante de gatos", "description": "Registra 100 gatos.", "category": "milestones", "rarity": "rare", "pawPrintReward": 50, "target": 100, "hidden": False, "metric": "cat_sightings"},
    {"id": "field_veteran", "title": "Veterano de campo", "description": "Registra 1000 avistamientos totales.", "category": "milestones", "rarity": "legendary", "pawPrintReward": 500, "target": 1000, "hidden": False, "metric": "total_sightings"},
    {"id": "lucky_encounter", "title": "Encuentro afortunado", "description": "Registra tu primera raza rara.", "category": "hidden", "rarity": "rare", "pawPrintReward": 100, "target": 1, "hidden": True, "metric": "rare_breed_sightings"},
    {"id": "perfect_balance", "title": "Equilibrio perfecto", "description": "Registra al menos un perro y un gato el mismo dia.", "category": "hidden", "rarity": "uncommon", "pawPrintReward": 25, "target": 1, "hidden": True, "metric": "balanced_same_day"},
    {"id": "double_discovery", "title": "Doble descubrimiento", "description": "Descubre dos razas nuevas el mismo dia.", "category": "hidden", "rarity": "rare", "pawPrintReward": 50, "target": 1, "hidden": True, "metric": "double_discovery_day"},
]


def normalize_text(value: str | None) -> str:
    normalized = unicodedata.normalize("NFKD", str(value or ""))
    without_accents = "".join(char for char in normalized if not unicodedata.combining(char))
    return re.sub(r"[^a-z0-9]+", " ", without_accents.lower()).strip()


def text_matches_alias(value: str | None, alias: str) -> bool:
    normalized = normalize_text(value)
    normalized_alias = normalize_text(alias)
    if not normalized or not normalized_alias:
        return False
    tokens = set(normalized.split())
    compact = normalized.replace(" ", "")
    compact_alias = normalized_alias.replace(" ", "")
    return (
        normalized_alias in normalized
        or compact_alias in compact
        or normalized_alias in tokens
        or compact_alias in tokens
    )


def animal_species(animal: models.Animal | None):
    return animal.especie if animal else None


def sighting_search_fields(sighting: models.Avistamiento) -> list[str | None]:
    animal = sighting.animal
    return [
        animal.nombre if animal else None,
        animal.color_principal if animal else None,
        sighting.descripcion,
    ]


def breed_for_sighting(sighting: models.Avistamiento) -> dict | None:
    species = animal_species(sighting.animal)
    for breed in BREEDS:
        if breed["species"] != species:
            continue
        if any(text_matches_alias(field, alias) for field in sighting_search_fields(sighting) for alias in breed["aliases"]):
            return breed
    return None


def max_consecutive_days(dates: set) -> int:
    if not dates:
        return 0

    sorted_dates = sorted(dates)
    longest = 1
    current = 1
    for index in range(1, len(sorted_dates)):
        delta = (sorted_dates[index] - sorted_dates[index - 1]).days
        if delta == 1:
            current += 1
        elif delta > 1:
            current = 1
        longest = max(longest, current)
    return longest


def calculate_metrics(usuario: models.Usuario, db: Session) -> dict[str, int]:
    db.flush()
    sightings = (
        db.query(models.Avistamiento)
        .options(joinedload(models.Avistamiento.animal))
        .filter(models.Avistamiento.id_usuario == usuario.id_usuario)
        .order_by(models.Avistamiento.fecha_creacion.asc())
        .all()
    )

    dog_sightings = 0
    cat_sightings = 0
    husky_sightings = 0
    rare_breed_sightings = 0
    unique_dog_breeds = set()
    unique_cat_breeds = set()
    first_breed_dates = {}
    species_by_day = defaultdict(set)
    active_dates = set()

    for sighting in sightings:
        species = animal_species(sighting.animal)
        if species == models.EspeciePermitida.PERRO:
            dog_sightings += 1
        elif species == models.EspeciePermitida.GATO:
            cat_sightings += 1

        created_at = sighting.fecha_creacion
        if isinstance(created_at, datetime):
            active_dates.add(created_at.date())
            species_by_day[created_at.date()].add(species)

        breed = breed_for_sighting(sighting)
        if not breed:
            continue

        if breed["id"] == "husky":
            husky_sightings += 1
        if breed["id"] in RARE_BREED_IDS:
            rare_breed_sightings += 1
        if breed["species"] == models.EspeciePermitida.PERRO:
            unique_dog_breeds.add(breed["id"])
        elif breed["species"] == models.EspeciePermitida.GATO:
            unique_cat_breeds.add(breed["id"])
        first_breed_dates.setdefault(breed["id"], created_at.date() if isinstance(created_at, datetime) else None)

    unique_total_breeds = unique_dog_breeds | unique_cat_breeds
    discoveries_by_day = Counter(date for date in first_breed_dates.values() if date is not None)

    return {
        "total_sightings": len(sightings),
        "dog_sightings": dog_sightings,
        "cat_sightings": cat_sightings,
        "husky_sightings": husky_sightings,
        "unique_dog_breeds": len(unique_dog_breeds),
        "unique_cat_breeds": len(unique_cat_breeds),
        "unique_total_breeds": len(unique_total_breeds),
        "max_daily_streak": max_consecutive_days(active_dates),
        "rare_breed_sightings": rare_breed_sightings,
        "balanced_same_day": int(any({models.EspeciePermitida.PERRO, models.EspeciePermitida.GATO}.issubset(species) for species in species_by_day.values())),
        "double_discovery_day": int(any(count >= 2 for count in discoveries_by_day.values())),
    }


def category_lookup() -> dict[str, dict]:
    return {category["id"]: category for category in ACHIEVEMENT_CATEGORIES}


def rarity_lookup() -> dict[str, dict]:
    return {rarity_id: rarity for rarity_id, rarity in ACHIEVEMENT_RARITIES.items()}


def evaluate_user_achievements(usuario: models.Usuario, db: Session) -> list[dict]:
    unlocked = {
        achievement.clave_logro: achievement
        for achievement in db.query(models.LogroUsuario)
        .filter(models.LogroUsuario.id_usuario == usuario.id_usuario)
        .all()
    }
    metrics = calculate_metrics(usuario, db)
    categories = category_lookup()
    rarities = rarity_lookup()
    responses = []

    for definition in ACHIEVEMENT_DEFINITIONS:
        achievement_id = definition["id"]
        target = int(definition["target"])
        raw_progress = int(metrics.get(definition["metric"], 0) or 0)
        progress = min(raw_progress, target)
        achievement_db = unlocked.get(achievement_id)

        if not achievement_db and raw_progress >= target:
            achievement_db = models.LogroUsuario(
                id_usuario=usuario.id_usuario,
                clave_logro=achievement_id,
                puntos_otorgados=definition["pawPrintReward"],
                fecha_desbloqueo=datetime.now(timezone.utc),
            )
            db.add(achievement_db)
            usuario.puntos_logros = (usuario.puntos_logros or 0) + definition["pawPrintReward"]
            db.flush()
            unlocked[achievement_id] = achievement_db

        completed = achievement_db is not None
        hidden = bool(definition["hidden"])
        visible = completed or not hidden
        category = categories[definition["category"]]
        rarity = rarities[definition["rarity"]]

        responses.append({
            "clave": achievement_id,
            "titulo": definition["title"] if visible else "???",
            "descripcion": definition["description"] if visible else "Logro oculto",
            "icono": category["icon"],
            "puntos": definition["pawPrintReward"],
            "patitas": definition["pawPrintReward"],
            "objetivo": target,
            "progreso": progress,
            "completado": completed,
            "fecha_desbloqueo": achievement_db.fecha_desbloqueo if achievement_db else None,
            "categoria": definition["category"],
            "categoria_titulo": category["label"],
            "rareza": definition["rarity"],
            "rareza_titulo": rarity["label"],
            "oculto": hidden,
        })

    return responses
