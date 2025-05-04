import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './AdminDashboard.css';

const API_URL = "http://127.0.0.1:5000";

function AdminDashboard() {
  const [classes, setClasses] = useState([]);
  const [newClass, setNewClass] = useState({ name: "", capacity: "", schedule: "" });
  const [editingClass, setEditingClass] = useState(null); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchClasses = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response && response.data){
        setClasses(response.data);
      } else {
        console.error("Unexpected response format:", response);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  }, [token]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  async function addClass(classData) {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API_URL}/classes`, classData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 201 && response.data.id) {
        setClasses((prev) => [...prev, response.data]);
        setNewClass({ name: "", capacity: "", schedule: "" });
      }
    } catch (error) {
      console.error("Error adding class:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteClass(classId) {
    try {
      if (!classId) return;
      const response = await axios.delete(`${API_URL}/classes/${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        setClasses(classes.filter((cls) => cls.id !== classId));
      }
    } catch (error) {
      console.error("Error deleting class:", error);
    }
  }

  async function updateClass(e, classId) {
    e.preventDefault();
    if (!editingClass?.id) return;

    try {
      const response = await axios.put(`${API_URL}/classes/${classId}`, editingClass, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        setClasses(classes.map((cls) => (cls.id === classId ? response.data : cls)));
        setEditingClass(null);
      }
    } catch (error) {
      console.error("Error updating class:", error);
    }
  }

  return (
    <div className="admin-container">
      <h1>Admin Dashboard</h1>

      <form onSubmit={(e) => { e.preventDefault(); addClass(newClass); }}>
        <input
          type="text"
          placeholder="Class Name"
          value={newClass.name}
          onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Capacity"
          value={newClass.capacity}
          onChange={(e) => setNewClass({ ...newClass, capacity: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Schedule"
          value={newClass.schedule}
          onChange={(e) => setNewClass({ ...newClass, schedule: e.target.value })}
          required
        />
        <button type="submit">Add Class</button>
      </form>

      <h2>All Classes</h2>
      <ul>
        {classes.map((cls) => (
          <li key={cls.id}>
            {editingClass?.id === cls.id ? (
              <form onSubmit={(e) => updateClass(e, cls.id)}>
                <input
                  type="text"
                  value={editingClass.name}
                  onChange={(e) => setEditingClass({ ...editingClass, name: e.target.value })}
                  required
                />
                <input
                  type="number"
                  value={editingClass.capacity}
                  onChange={(e) => setEditingClass({ ...editingClass, capacity: e.target.value })}
                  required
                />
                <input
                  type="text"
                  value={editingClass.schedule}
                  onChange={(e) => setEditingClass({ ...editingClass, schedule: e.target.value })}
                  required
                />
                <button type="submit">Save</button>
                <button type="button" onClick={() => setEditingClass(null)}>Cancel</button>
              </form>
            ) : (
              <>
                {cls.name} - {cls.schedule} (Capacity: {cls.capacity})
                <div>
                  <button onClick={() => deleteClass(cls.id)}>Delete</button>
                  <button onClick={() => setEditingClass(cls)}>Edit</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminDashboard;
