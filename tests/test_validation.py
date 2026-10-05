import os
import unittest

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("SECRET_KEY", "test-secret-key-that-is-long-enough")

from pydantic import ValidationError
from schemas import AnimalCreate, AvistamientoCreate, UsuarioCreate
from security import obtener_password_hasheado, verificar_password


class InputValidationTest(unittest.TestCase):
    def test_login_rejects_oversized_passwords_without_crashing(self):
        hashed = obtener_password_hasheado("correct-password")
        self.assertTrue(verificar_password("correct-password", hashed))
        self.assertFalse(verificar_password("wrong-password", hashed))
        self.assertFalse(verificar_password("x" * 73, hashed))
        self.assertFalse(verificar_password("🐾" * 19, hashed))

    def test_animal_rejects_invalid_coordinates_and_database_overflows(self):
        valid = dict(especie="Gato", color_principal="Negro", latitud=4.7, longitud=-74)
        for overrides in (
            {"latitud": 91}, {"longitud": -181}, {"latitud": float("inf")},
            {"nombre": "x" * 81}, {"color_principal": "x" * 51},
            {"color_principal": "   "}, {"descripcion": "x" * 256},
        ):
            with self.subTest(overrides=overrides), self.assertRaises(ValidationError):
                AnimalCreate(**(valid | overrides))

    def test_sighting_allows_real_zero_coordinates_but_rejects_out_of_range(self):
        sighting = AvistamientoCreate(latitud=0, longitud=0, descripcion="")
        self.assertEqual(sighting.latitud, 0)
        with self.assertRaises(ValidationError):
            AvistamientoCreate(latitud=-91, longitud=0, descripcion="")

    def test_registration_rejects_invalid_username(self):
        for name in ("", "   ", "x" * 51):
            with self.subTest(name=name), self.assertRaises(ValidationError):
                UsuarioCreate(username=name, email="tester@example.com", password="test")
