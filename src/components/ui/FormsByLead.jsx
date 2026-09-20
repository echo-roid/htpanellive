
import React, { useState, useEffect } from 'react';
import { useParams ,Link} from 'react-router-dom';
import { FaPlus, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import bookImage  from "../../assets/book.png"


const FormsByLead = () => {
  const { id } = useParams();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
   const [clone, setClone] = useState(null);

    const [loadingId, setLoadingId] = useState(null);



  const handleCloneForm = async (formId) => {
  if (window.confirm('Are you sure you want to clone this form?')) {
    try {
      const response = await fetch(`https://tableware-dweeb-estate.ngrok-free.dev/api/forms/${formId}/clone`, {
        method: 'POST'
      });
      const data = await response.json();

      if (response.ok) {
        alert('Form cloned successfully!');
        setClone(data)
        // Optional: Refresh the forms list
        // window.location.reload();
      } else {
        alert(data.message || 'Failed to clone form');
      }
    } catch (error) {
      console.error('Error cloning form:', error);
      alert('An error occurred while cloning the form');
    }
  }
};


 const handleDelete = async (formId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this form?");
    if (!confirmDelete) return;

    try {
      setLoadingId(formId);

      const response = await fetch(`https://tableware-dweeb-estate.ngrok-free.dev/api/forms/forms/${formId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert("✅ Form deleted successfully!");
     
      } else {
        alert("❌ Failed to delete form: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error deleting form:", error);
      alert("⚠️ Error deleting form. Please try again.");
    } finally {
      setLoadingId(null);
    }
  };

  useEffect(() => {
    const fetchForms = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://tableware-dweeb-estate.ngrok-free.dev/api/forms/lead/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch forms');
        }

        setForms(data.forms);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, [id,clone]);

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">Loading forms...</div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
         <div className='flex justify-between align-center w-full'>
                                      <h6 className='!font-bold text-[22px] mb-5'>Form</h6>
                                      <p className='mb-0 text-[10px] flex gap-1'>
                                          <img src={bookImage} className='mt-0 w-[15px] h-[15px]'/>
                                          Learn More About The Form
                                      </p>
                                  </div>
        {/* <button 
          className="bg-blue-600 text-white py-2 px-4 rounded flex items-center"
          onClick={() => window.location.href = `/lead/${id}/form-builder`}
        >
          <FaPlus className="mr-2" /> Start a new form
        </button> */}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div 
          className="bg-white rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition"
          // onClick={() => window.location.href = `/forms/${id}`}
        >
          <FaPlus className="text-4xl text-gray-400 mb-2" />
          <span className="text-gray-500"><Link 
         to={`/forms/${id}`}> Blank Form</Link></span>
        </div>

       {forms.map(form => (
  <div key={form.id} className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 cursor-pointer hover:shadow-lg transition">
    <div className="p-4 border-b border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800 truncate mb-1">{form.name}</h2>
      <p className="text-sm text-gray-500 truncate">ID: {form.share_id}</p>
    </div>

    <div className="p-4 flex flex-col gap-2">
      <Link 
        to={`/SharedFormView/${form.share_id}`}
        className="text-blue-600 hover:text-blue-800 flex items-center"
      >
        <FaEye className="mr-2" /> View
      </Link>

      <Link 
        to={`/operations/EditFormPage/${form.share_id}`}
        className="text-green-600 hover:text-green-800 flex items-center"
      >
        <FaEdit className="mr-2" /> Edit
      </Link>

      <button 
        className="text-red-600 hover:text-red-800 flex items-center" 
        onClick={() => handleCloneForm(form.id)}
      >
        <FaTrash className="mr-2" /> Copy
      </button>

      <button className="text-red-600 hover:text-red-800 flex items-center"   onClick={() => handleDelete(form.id)}>
        <FaTrash className="mr-2" /> Delete
      </button>
    </div>
  </div>
))}
      </div>
    </div>
  );
};

export default FormsByLead;
