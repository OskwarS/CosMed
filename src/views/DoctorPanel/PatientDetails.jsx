import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

import '../../DashboardShared.css';

export default function PatientDetails() {
  const { id } = useParams(); // Pobiera ID z paska adresu
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();

  const role = localStorage.getItem('user_role');
  let backLink = '/';

  if (role === 'admin') {
    backLink = '/admin';
  } else if (role === 'doctor') {
    backLink = '/lekarz';
  }

  useEffect(() => {
    // Pobieramy dane z naszego nowego pliku API
    fetch(`/api/patients/get-patient?id=${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Nie udało się pobrać danych');
        return res.json();
      })
      .then(data => {
        setPatient(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleDelete = async () => {
    const isConfirmed = window.confirm(
      "Czy na pewno chcesz usunąć tego pacjenta?\nTej operacji nie można cofnąć."
    );

    if (!isConfirmed) {
        return;
    }

    setError(null);
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/patients/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Błąd usunięcia');
      }
      navigate(`/admin`);

    } catch (err) {
      setError(err.message);
      setIsDeleting(false);
    }
  };

  // Obsługa stanów ładowania i błędów
  if (loading) return <div style={{ padding: 20 }}>Ładowanie danych pacjenta...</div>;
  if (error) return <div style={{ padding: 20, color: 'red' }}>Błąd: {error}</div>;
  if (!patient) return <div style={{ padding: 20 }}>Nie znaleziono pacjenta.</div>;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1> Pacjent: {patient.first_name} {patient.last_name} </h1>
        <div className="dash-actions">
          <button 
          onClick={handleDelete}
          className="dash-btn dash-btn-danger"
          disabled={isDeleting}
          style={{ opacity: isDeleting ? 0.5 : 1 }}>
          {isDeleting ? 'Usuwanie...' : 'Usuń'}
          </button>
          <Link to={`/admin/patient-edit/${id}`} className="dash-btn dash-btn-primary">Edytuj dane</Link>
          <Link to={backLink} className="dash-btn dash-btn-return">Wróć do listy</Link>
        </div>
      </div>

      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', background: 'white' }}>
        <h2>Dane Pacjenta:</h2>

        <ul>
          <li><strong>Imię:</strong> {patient.first_name}</li>
          <li><strong>Nazwisko:</strong> {patient.last_name}</li>
          <li><strong>PESEL:</strong> {patient.pesel}</li>
          <li><strong>Adres:</strong> {patient.address}</li>
          <li><strong>Ubezpieczenie:</strong> {patient.insurance}</li>

          <li><strong>Alergie:</strong></li>
          <ul>
            {patient.allergies && patient.allergies.length > 0 ? (
               patient.allergies.map((a, i) => <li key={i}>{a}</li>)
            ) : <li>Brak</li>}
          </ul>

          <li><strong>Historia chorób:</strong></li>
          <ul>
             {patient.medical_history && Array.isArray(patient.medical_history) ? (
                patient.medical_history.map((h, i) => (
                  <li key={i}>
                    {h.date} - {h.disease} ({h.description})
                  </li>
                ))
             ) : <li>Brak historii</li>}
          </ul>
        </ul>
      </div>
    </div>
  );
}