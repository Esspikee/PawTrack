import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import Icon from "../components/Icon";
import PixelButton from "../components/PixelButton";
import TopBar from "../components/TopBar";
import { usePawTrack } from "../context/usePawTrack";

const initialForm = {
  location: "",
  date: "19/06/2026",
  time: "20:45",
  description: "",
  photoUrl: "",
};

function ReportSighting() {
  const { animalId } = useParams();
  const { addSighting, animals } = usePawTrack();
  const [selectedAnimalId, setSelectedAnimalId] = useState(animalId ?? animals[0]?.id);
  const [form, setForm] = useState(initialForm);
  const navigate = useNavigate();

  const selectedAnimal = animals.find((animal) => animal.id === selectedAnimalId) ?? animals[0];

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const animal = addSighting(selectedAnimal.id, form);
    navigate(`/animals/${animal.id}/history`);
  };

  return (
    <AppShell>
      <TopBar backTo={selectedAnimal ? `/animals/${selectedAnimal.id}` : "/dashboard"} title="Nuevo avistamiento" />

      <form className="report-form" onSubmit={handleSubmit}>
        <label>
          Animal
          <span className="input-wrap">
            <select
              name="animal"
              onChange={(event) => setSelectedAnimalId(event.target.value)}
              value={selectedAnimal?.id}
            >
              {animals.map((animal) => (
                <option key={animal.id} value={animal.id}>
                  {animal.name}
                </option>
              ))}
            </select>
            <Icon name="paw" size={20} />
          </span>
        </label>

        <label>
          Ubicacion
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
            placeholder="Describe lo que viste..."
            required
            rows="5"
            value={form.description}
          />
        </label>

        <label>
          Foto (URL opcional)
          <span className="input-wrap">
            <input
              name="photoUrl"
              onChange={updateField}
              placeholder="https://"
              type="url"
              value={form.photoUrl}
            />
            <Icon name="mail" size={20} />
          </span>
        </label>

        <PixelButton className="full-width" type="submit">
          Enviar reporte
        </PixelButton>
      </form>
    </AppShell>
  );
}

export default ReportSighting;
