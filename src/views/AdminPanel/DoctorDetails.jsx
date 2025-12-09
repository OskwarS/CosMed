import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

import '../../DashboardShared.css';

export default function DoctorDetails() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Pobieramy dane z naszego nowego pliku API
    fetch(`/api/doctors/get-doctor?id=${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Nie udało się pobrać danych');
        return res.json();
      })
      .then(data => {
        setDoctor(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleDelete = async () => {
    const isConfirmed = window.confirm(
      "Czy na pewno chcesz usunąć tego lekarza?\nTej operacji nie można cofnąć."
    );

    if (!isConfirmed) {
        return;
    }

    setError(null);
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/doctors/${id}`, {
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
  if (loading) return <div style={{ padding: 20 }}>Ładowanie danych doktora...</div>;
  if (error) return <div style={{ padding: 20, color: 'red' }}>Błąd: {error}</div>;
  if (!doctor) return <div style={{ padding: 20 }}>Nie znaleziono doktora.</div>;

  return (
    <div className="dash-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1> Doktor: {doctor.first_name} {doctor.last_name} </h1>
        <div className="dash-actions">
          <button 
            onClick={handleDelete}
            className="dash-btn dash-btn-danger"
            disabled={isDeleting}
            style={{ opacity: isDeleting ? 0.5 : 1 }}
          >
            {isDeleting ? 'Usuwanie...' : 'Usuń'}
          </button>
          <Link to={`/admin/doctor-edit/${id}`} className="dash-btn dash-btn-primary">Edytuj dane</Link>
          <Link to='/admin' className="dash-btn dash-btn-return">Wróć do listy</Link>
        </div>
      </div>

      <div className="dash-box"> 
        <h2>Dane doktora:</h2>
        <ul>
          <li><strong>Imię:</strong> {doctor.first_name}</li>
          <li><strong>Nazwisko:</strong> {doctor.last_name}</li>
          <li><strong>Specializacja:</strong> {doctor.specialization}</li>
          <li><strong>Email:</strong> {doctor.email}</li>
        </ul>
      </div>

      <div className="dash-box">        
        <h2>Pacjenci doktora:</h2>
        <ul>
          
        </ul>
      </div>

      <div className="dash-box">        
        <h2>Harmonogram:</h2>
        <ul>
          
        </ul>
      </div>
    </div>
  );
}