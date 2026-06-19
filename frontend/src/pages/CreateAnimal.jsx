import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import Icon from "../components/Icon";
import PixelButton from "../components/PixelButton";
import TopBar from "../components/TopBar";
import { usePawTrack } from "../context/usePawTrack";

const initialForm = {
  name: "",
  species: "Perro",
  color: "",
  location: "",
  date: "19/06/2026",
  time: "20:30",
  description: "",
};

function CreateAnimal() {
  const [form, setForm] = useState(initialForm);
  const { addAnimal } = usePawTrack();
  const navigate = useNavigate();

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const animal = addAnimal(form);
    navigate(`/animals/${animal.id}`);
  };

  return (
    <AppShell>
      <TopBar backTo="/animals" title="Anadir animal" />

      <form className="report-form" onSubmit={handleSubmit}>
        <label>
          Nombre
          <span className="input-wrap">
            <input
              name="name"
              onChange={updateField}
              placeholder="Ej. Canela"
              required
              type="text"
              value={form.name}
            />
            <Icon name="paw" size={20} />
          </span>
        </label>

        <label>
          Especie
          <span className="input-wrap">
            <select name="species" onChange={updateField} value={form.species}>
              <option>Perro</option>
              <option>Gato</option>
              <option>Otro</option>
            </select>
            <Icon name="paw" size={20} />
          </span>
        </label>

        <label>
          Color principal
          <span className="input-wrap">
            <input
              name="color"
              onChange={updateField}
              placeholder="Dorado, blanco, atigrado..."
              required
              type="text"
              value={form.color}
            />
            <Icon name="star" size={20} />
          </span>
        </label>

        <label>
          Ubicacion inicial
          <span className="input-wrap">
            <input
              name="location"
              onChange={updateField}
              placeholder="Selecciona en el mapa"
              required
              type="text"
              value={form.location}
            />
            <Icon name="mapPin" size={20} />
          </span>
        </label>

        <label>
          Fecha y hora
          <span className="split-inputs">
            <input name="date" onChange={updateField} required type="text" value={form.date} />
            <input name="time" onChange={updateField} required type="text" value={form.time} />
            <Icon name="calendar" size={20} />
          </span>
        </label>

        <label>
          Descripcion
          <textarea
            name="description"
            onChange={updateField}
            placeholder="Describe rasgos, collar o comportamiento..."
            required
            rows="5"
            value={form.description}
          />
        </label>

        <PixelButton className="full-width" type="submit">
          Guardar animal
        </PixelButton>
      </form>
    </AppShell>
  );
}

export default CreateAnimal;
