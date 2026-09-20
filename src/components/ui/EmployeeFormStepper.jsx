import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, Plus, Trash2, X } from 'lucide-react';

const steps = [
  'Basic Details',
  'Identity Details',
  'International Details',
  'Emergency Contact',
  'Education',
  'Financial Info',
];

const EmployeeFormStepper = () => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    emergencyContacts: [{ name: '', relation: '', phone: '' }]
  });
  const [previewUrls, setPreviewUrls] = useState({});
  const [errors, setErrors] = useState({});
  const [emergencyContacts, setEmergencyContacts] = useState([
    { name: '', relation: '', phone: '' }
  ]);

  const validateStep = () => {
    const newErrors = {};

    const requiredFieldsByStep = {
      0: ['title', 'firstName', 'lastName', 'contactNumber', 'fatherName', 'motherName', 'birthDate', 'email', 'photo', "bloodGroup"],
      1: ['aadharCard', 'address', 'houseNumber', 'state', 'city', 'Aadhar', 'AadharBack'],
      3: [], // Emergency contacts handled separately
      5: ['pan', 'bankAccountName', 'bankName', 'bankAccountNumber', 'bankIfsc', 'bankBranch'],
    };

    const requiredFields = requiredFieldsByStep[step] || [];
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required';
      }
    });

    if (step === 3) {
      emergencyContacts.forEach((contact, index) => {
        if (!contact.name) newErrors[`emergencyName_${index}`] = 'Name is required';
        if (!contact.relation) newErrors[`emergencyRelation_${index}`] = 'Relation is required';
        if (!contact.phone) newErrors[`emergencyPhone_${index}`] = 'Phone is required';
      });

      if (emergencyContacts.length === 0 || 
          emergencyContacts.some(contact => !contact.name || !contact.relation || !contact.phone)) {
        newErrors.emergencyContacts = 'At least one complete emergency contact is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      const file = files[0];
      setFormData(prev => ({ ...prev, [name]: file }));
      if (file?.type?.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setPreviewUrls(prev => ({ ...prev, [name]: reader.result }));
        reader.readAsDataURL(file);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  // Function to remove uploaded file and preview
  const removeFile = (fieldName) => {
    setFormData(prev => ({ ...prev, [fieldName]: null }));
    setPreviewUrls(prev => {
      const newPreviewUrls = { ...prev };
      delete newPreviewUrls[fieldName];
      return newPreviewUrls;
    });
    
    // Reset the file input
    const fileInput = document.querySelector(`input[name="${fieldName}"]`);
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleEmergencyContactChange = (index, e) => {
    const { name, value } = e.target;
    const updatedContacts = [...emergencyContacts];
    updatedContacts[index][name] = value;
    setEmergencyContacts(updatedContacts);
  };

  const addEmergencyContact = () => {
    setEmergencyContacts([...emergencyContacts, { name: '', relation: '', phone: '' }]);
  };

  const removeEmergencyContact = (index) => {
    if (emergencyContacts.length <= 1) return;
    const updatedContacts = [...emergencyContacts];
    updatedContacts.splice(index, 1);
    setEmergencyContacts(updatedContacts);
  };

  const nextStep = () => {
    if (validateStep()) {
      // Save emergency contacts to formData before moving to next step
      if (step === 3) {
        setFormData(prev => ({ ...prev, emergencyContacts }));
      }
      setStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => {
    // Save emergency contacts to formData before moving to previous step
    if (step === 3) {
      setFormData(prev => ({ ...prev, emergencyContacts }));
    }
    setStep(prev => Math.max(prev - 1, 0));
  };

  const isLastStep = step === steps.length - 1;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    const form = new FormData();
    
    // Add all form data except emergencyContacts
    Object.keys(formData).forEach(key => {
      if (key !== 'emergencyContacts' && formData[key]) {
        form.append(key, formData[key]);
      }
    });

    // Add emergency contacts to form data
    emergencyContacts.forEach((contact, index) => {
      form.append(`emergencyContacts[${index}][name]`, contact.name);
      form.append(`emergencyContacts[${index}][relation]`, contact.relation);
      form.append(`emergencyContacts[${index}][phone]`, contact.phone);
    });

    try {
      const response = await fetch('https://tableware-dweeb-estate.ngrok-free.dev/api/forms/employee-form', {
        method: 'POST',
        body: form,
      });

      if (!response.ok) throw new Error('Form submission failed');
      const result = await response.json();
      // alert('✅ Employee Submitted Successfully!');
      console.log('✅ Success:', result);
      
      // Reset form after successful submission
      setFormData({ emergencyContacts: [{ name: '', relation: '', phone: '' }] });
      setEmergencyContacts([{ name: '', relation: '', phone: '' }]);
      setPreviewUrls({});
      setErrors({});
      setStep(0);
    } catch (err) {
      console.error('❌ Submission Error:', err);
      alert('❌ Submission failed. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-3xl font-bold text-sky-500 mb-6">Employee Registration</h2>
      <ProgressBar step={step} steps={steps} />

      <form onSubmit={handleSubmit} className="space-y-6 mt-4">
        {step === 0 && (
          <StepWrapper title="1️⃣ Basic Details">
            <LabeledInput 
              label="Title (Mr/Mrs)" 
              name="title" 
              value={formData.title || ''}
              onChange={handleChange} 
              error={errors.title} 
            />
            <LabeledInput 
              label="First Name" 
              name="firstName" 
              value={formData.firstName || ''}
              onChange={handleChange} 
              error={errors.firstName} 
            />
            <LabeledInput 
              label="Last Name" 
              name="lastName" 
              value={formData.lastName || ''}
              onChange={handleChange} 
              error={errors.lastName} 
            />
            <LabeledInput 
              label="Contact Number" 
              name="contactNumber" 
              value={formData.contactNumber || ''}
              onChange={handleChange} 
              error={errors.contactNumber} 
            />
            <LabeledInput 
              label="Father's Name" 
              name="fatherName" 
              value={formData.fatherName || ''}
              onChange={handleChange} 
              error={errors.fatherName} 
            />
            <LabeledInput 
              label="Mother's Name" 
              name="motherName" 
              value={formData.motherName || ''}
              onChange={handleChange} 
              error={errors.motherName} 
            />
            <LabeledInput 
              label="Birth Date" 
              name="birthDate" 
              type="date" 
              value={formData.birthDate || ''}
              onChange={handleChange} 
              error={errors.birthDate} 
            />
            <LabeledInput 
              label="Email" 
              name="email" 
              type="email" 
              value={formData.email || ''}
              onChange={handleChange} 
              error={errors.email} 
            />
            <LabeledInput 
              label="Blood Group" 
              name="bloodGroup" 
              value={formData.bloodGroup || ''}
              onChange={handleChange} 
              error={errors.bloodGroup} 
            />
            <FileUpload 
              label="Upload Photo" 
              name="photo" 
              preview={previewUrls.photo} 
              onChange={handleChange} 
              onRemove={() => removeFile('photo')}
              error={errors.photo} 
            />
          </StepWrapper>
        )}

        {step === 1 && (
          <StepWrapper title="2️⃣ Identity Details">
            <FileUpload 
              label="Upload Front Aadhar" 
              name="Aadhar" 
              preview={previewUrls.Aadhar}
              onChange={handleChange} 
              onRemove={() => removeFile('Aadhar')}
              error={errors.Aadhar} 
            />
            <FileUpload 
              label="Upload Back Aadhar" 
              name="AadharBack" 
              preview={previewUrls.AadharBack}
              onChange={handleChange} 
              onRemove={() => removeFile('AadharBack')}
              error={errors.AadharBack} 
            />
            <LabeledInput 
              label="Aadhar Card Number" 
              name="aadharCard" 
              value={formData.aadharCard || ''}
              onChange={handleChange} 
              error={errors.aadharCard} 
            />
            <LabeledInput 
              label="Permanent Address" 
              name="address" 
              value={formData.address || ''}
              onChange={handleChange} 
              error={errors.address} 
            />
            <LabeledInput 
              label="House Number" 
              name="houseNumber" 
              value={formData.houseNumber || ''}
              onChange={handleChange} 
              error={errors.houseNumber} 
            />
            <LabeledInput 
              label="City" 
              name="city" 
              value={formData.city || ''}
              onChange={handleChange} 
              error={errors.city} 
            />
            <LabeledInput 
              label="State" 
              name="state" 
              value={formData.state || ''}
              onChange={handleChange} 
              error={errors.state} 
            />
          </StepWrapper>
        )}

        {step === 2 && (
          <StepWrapper title="3️⃣ International Details (Optional)">
            <FileUpload
              label="Passport Front"
              name="passportFront"
              preview={previewUrls.passportFront}
              onChange={handleChange}
              onRemove={() => removeFile('passportFront')}
            />
            <FileUpload
              label="Passport Back"
              name="passportBack"
              preview={previewUrls.passportBack}
              onChange={handleChange}
              onRemove={() => removeFile('passportBack')}
            />
            <LabeledInput
              label="Surname (Last Name)"
              name="passportSurname"
              value={formData.passportSurname || ''}
              onChange={handleChange}
            />
            <LabeledInput
              label="Given Name(s) (First Name, Middle Name)"
              name="passportGivenNames"
              value={formData.passportGivenNames || ''}
              onChange={handleChange}
            />
            <LabeledInput
              label="Date of Birth"
              name="passportDob"
              type="date"
              value={formData.passportDob || ''}
              onChange={handleChange}
            />
            <LabeledInput
              label="Place of Birth"
              name="passportPlaceOfBirth"
              value={formData.passportPlaceOfBirth || ''}
              onChange={handleChange}
            />
            <LabeledInput
              label="Passport Number"
              name="passportNumber"
              value={formData.passportNumber || ''}
              onChange={handleChange}
            />
            <LabeledInput
              label="Date of Issue"
              name="passportIssueDate"
              type="date"
              value={formData.passportIssueDate || ''}
              onChange={handleChange}
            />
            <LabeledInput
              label="Date of Expiry"
              name="passportExpireDate"
              type="date"
              value={formData.passportExpireDate || ''}
              onChange={handleChange}
            />
            <LabeledInput
              label="Nationality"
              name="passportNationality"
              value={formData.passportNationality || ''}
              onChange={handleChange}
            />
            <LabeledInput
              label="Sex"
              name="passportSex"
              value={formData.passportSex || ''}
              onChange={handleChange}
            />
            <LabeledInput
              label="Place of Issue"
              name="passportPlaceOfIssue"
              value={formData.passportPlaceOfIssue || ''}
              onChange={handleChange}
            />
            <LabeledInput
              label="Mother's Name"
              name="passportMotherName"
              value={formData.passportMotherName || ''}
              onChange={handleChange}
            />
            <LabeledInput
              label="Father's Name"
              name="passportFatherName"
              value={formData.passportFatherName || ''}
              onChange={handleChange}
            />
          </StepWrapper>
        )}

        {step === 3 && (
          <StepWrapper title="4️⃣ Emergency Contact">
            <div className="md:col-span-2 space-y-4">
              {emergencyContacts.map((contact, index) => (
                <div key={index} className="border p-4 rounded-lg relative">
                  {emergencyContacts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEmergencyContact(index)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      title="Remove contact"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                  <h4 className="font-medium text-gray-700 mb-3">Emergency Contact #{index + 1}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <LabeledInput 
                      label="Contact Person Name" 
                      name="name" 
                      value={contact.name}
                      onChange={(e) => handleEmergencyContactChange(index, e)} 
                      error={errors[`emergencyName_${index}`]} 
                    />
                    <LabeledInput 
                      label="Relation" 
                      name="relation" 
                      value={contact.relation}
                      onChange={(e) => handleEmergencyContactChange(index, e)} 
                      error={errors[`emergencyRelation_${index}`]} 
                    />
                    <LabeledInput 
                      label="Primary Contact Number" 
                      name="phone" 
                      value={contact.phone}
                      onChange={(e) => handleEmergencyContactChange(index, e)} 
                      error={errors[`emergencyPhone_${index}`]} 
                    />
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addEmergencyContact}
                className="flex items-center text-sky-500 hover:text-sky-700 mt-2"
              >
                <Plus size={18} className="mr-1" /> Add Another Emergency Contact
              </button>
              
              {errors.emergencyContacts && (
                <p className="text-sm text-red-500">{errors.emergencyContacts}</p>
              )}
            </div>
          </StepWrapper>
        )}

        {step === 4 && (
          <StepWrapper title="5️⃣ Educational Details">
            <FileUpload 
              label="10th Certificate" 
              name="edu10th" 
              preview={previewUrls.edu10th}
              onChange={handleChange} 
              onRemove={() => removeFile('edu10th')}
            />
            <FileUpload 
              label="12th Certificate" 
              name="edu12th" 
              preview={previewUrls.edu12th}
              onChange={handleChange} 
              onRemove={() => removeFile('edu12th')}
            />
            <FileUpload 
              label="Graduation Certificate" 
              name="graduation" 
              preview={previewUrls.graduation}
              onChange={handleChange} 
              onRemove={() => removeFile('graduation')}
            />
            <FileUpload 
              label="Diploma (Optional)" 
              name="diploma" 
              preview={previewUrls.diploma}
              onChange={handleChange} 
              onRemove={() => removeFile('diploma')}
            />
          </StepWrapper>
        )}

        {step === 5 && (
          <StepWrapper title="6️⃣ Financial Details">
            <LabeledInput 
              label="PAN Number" 
              name="pan" 
              value={formData.pan || ''}
              onChange={handleChange} 
              error={errors.pan} 
            />
            <LabeledInput 
              label="Name AS Per A/C" 
              name="bankAccountName" 
              value={formData.bankAccountName || ''}
              onChange={handleChange} 
              error={errors.bankAccountName} 
            />
            <LabeledInput 
              label="Bank" 
              name="bankName" 
              value={formData.bankName || ''}
              onChange={handleChange} 
              error={errors.bankName} 
            />
            <LabeledInput 
              label="A/C Number" 
              name="bankAccountNumber" 
              value={formData.bankAccountNumber || ''}
              onChange={handleChange} 
              error={errors.bankAccountNumber} 
            />
            <LabeledInput 
              label="IFSC Code" 
              name="bankIfsc" 
              value={formData.bankIfsc || ''}
              onChange={handleChange} 
              error={errors.bankIfsc} 
            />
            <LabeledInput 
              label="Branch Name" 
              name="bankBranch" 
              value={formData.bankBranch || ''}
              onChange={handleChange} 
              error={errors.bankBranch} 
            />
            <LabeledInput 
              label="UAN (Optional)" 
              name="uan" 
              value={formData.uan || ''}
              onChange={handleChange} 
            />
            <FileUpload 
              label="Pan Document" 
              name="panDocument" 
              preview={previewUrls.panDocument}
              onChange={handleChange} 
              onRemove={() => removeFile('panDocument')}
            />
            <FileUpload 
              label="Cancel Cheque Document" 
              name="cancelCheque" 
              preview={previewUrls.cancelCheque}
              onChange={handleChange} 
              onRemove={() => removeFile('cancelCheque')}
            />
            <FileUpload 
              label="UAN Document (Optional)" 
              name="uanDocument" 
              preview={previewUrls.uanDocument}
              onChange={handleChange} 
              onRemove={() => removeFile('uanDocument')}
            />
          </StepWrapper>
        )}

        <div className="flex justify-between pt-4">
          {step > 0 ? (
            <button type="button" onClick={prevStep} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
              <ArrowLeft className="inline-block mr-2" size={18} /> Back
            </button>
          ) : <div />}
          {!isLastStep ? (
            <button type="button" onClick={nextStep} className="px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600">
              Next <ArrowRight className="inline-block ml-2" size={18} />
            </button>
          ) : (
            <button type="submit" className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600">
              Submit <Check className="inline-block ml-2" size={18} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

// Helper Components (updated FileUpload component)
const StepWrapper = ({ title, children }) => (
  <div>
    <h3 className="text-xl font-semibold text-sky-600 mb-4">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
  </div>
);

const ProgressBar = ({ step, steps }) => (
  <div className="flex items-center mb-6">
    {steps.map((label, index) => (
      <div key={index} className="flex items-center w-full">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold 
          ${index <= step ? 'bg-sky-500' : 'bg-gray-300'}`}>
          {index + 1}
        </div>
        {index < steps.length - 1 && (
          <div className={`flex-1 h-1 ${index < step ? 'bg-sky-500' : 'bg-gray-300'}`}></div>
        )}
      </div>
    ))}
  </div>
);

const LabeledInput = ({ label, name, type = 'text', value, onChange, error }) => (
  <div>
    <label className="block mb-1 text-sm font-medium text-gray-700">{label}</label>
    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      className={`p-2 border rounded w-full ${error ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-sky-500`}
    />
    {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
  </div>
);

const FileUpload = ({ label, name, preview, onChange, onRemove, error }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="flex items-center gap-2">
      <input
        name={name}
        type="file"
        onChange={onChange}
        className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-sky-500 file:px-4 file:py-2 file:text-white hover:file:bg-sky-600"
      />
      {preview && (
        <button
          type="button"
          onClick={onRemove}
          className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50"
          title="Remove file"
        >
          <X size={18} />
        </button>
      )}
    </div>
    {preview && (
      <div className="relative inline-block">
        <img src={preview} alt="Preview" className="h-20 rounded shadow-md" />
        <button
          type="button"
          onClick={onRemove}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
          title="Remove image"
        >
          <X size={14} />
        </button>
      </div>
    )}
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
);

export default EmployeeFormStepper;