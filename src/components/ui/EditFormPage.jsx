import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronDown, Plus } from "lucide-react";

const Pop = ({ url, setFormUrl }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    alert('URL copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          onClick={() => setFormUrl("")}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Form Updated Successfully!</h2>
        <div className="mb-4">
          <p className="text-gray-600 mb-2">Share this URL to access your form:</p>
          <div className="bg-gray-100 p-3 rounded break-words">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {url}
            </a>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={copyToClipboard}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Copy URL
          </button>
          <button
            onClick={() => {
              window.open(url, '_blank');
              setFormUrl("");
            }}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Open Form
          </button>
        </div>
      </div>
    </div>
  );
};

const RuleBuilder = ({ setConditionshow, steps, fieldOptions, onSaveRules, formRules, setFormRules }) => {
  const uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const [conditions, setConditions] = useState([
    { id: uuidv4(), field: "", state: "Is Filled", value: "", fieldType: "" }
  ]);

  const [actions, setActions] = useState([
    { id: uuidv4(), action: "Show", target: "" }
  ]);

  const [logicOperators, setLogicOperators] = useState([]);

  const getStateOptions = (fieldType) => {
    const commonOptions = ['Is Filled', 'Is Empty'];

    switch (fieldType) {
      case 'text':
      case 'dropdown':
        return ['Equals', 'Not Equals', ...commonOptions];
      case 'number':
      case 'date':
      case 'time':
        return [
          'Equals', 'Not Equals',
          'Greater Than', 'Less Than',
          'Greater or Equal', 'Less or Equal',
          ...commonOptions
        ];
      default:
        return ['Equals', 'Not Equals', ...commonOptions];
    }
  };

  const handleFieldChange = (id, fieldId) => {
    const selectedField = fieldOptions.find(f => f.id === fieldId);
    let fieldType = selectedField?.type || 'text';

    // Special handling for date/time fields
    const element = steps.flatMap(step => step.elements).find(el => el.id === fieldId);
    if (element) {
      if (element.type === 'date') fieldType = 'date';
      if (element.type === 'time') fieldType = 'time';
    }

    setConditions(prev => prev.map(cond =>
      cond.id === id ? {
        ...cond,
        field: fieldId,
        fieldType,
        state: "Is Filled",
        value: ""
      } : cond
    ));
  };

  const handleStateChange = (id, state) => {
    setConditions(prev => prev.map(cond =>
      cond.id === id ? { ...cond, state, value: "" } : cond
    ));
  };

  const handleValueChange = (id, value) => {
    setConditions(prev => prev.map(cond =>
      cond.id === id ? { ...cond, value } : cond
    ));
  };

  const handleLogicChange = (index, operator) => {
    const newOperators = [...logicOperators];
    newOperators[index] = operator;
    setLogicOperators(newOperators);
  };

  const addCondition = () => {
    const newCondition = {
      id: uuidv4(),
      field: "",
      state: "Is Filled",
      value: "",
      fieldType: ""
    };
    setConditions([...conditions, newCondition]);

    if (conditions.length > 0) {
      setLogicOperators([...logicOperators, 'AND']);
    }
  };

  const removeCondition = (id) => {
    const index = conditions.findIndex(c => c.id === id);
    if (index === -1) return;

    const newConditions = conditions.filter(c => c.id !== id);
    setConditions(newConditions);

    if (conditions.length > 1) {
      const newOperators = [...logicOperators];
      if (index === 0) {
        newOperators.shift();
      } else if (index === conditions.length - 1) {
        newOperators.pop();
      } else {
        newOperators.splice(index - 1, 1);
      }
      setLogicOperators(newOperators);
    } else {
      setLogicOperators([]);
    }
  };

  const addAction = () => {
    setActions([
      ...actions,
      { id: uuidv4(), action: "Show", target: "" }
    ]);
  };

  const removeAction = (id) => {
    setActions(actions.filter(a => a.id !== id));
  };

  const saveRules = () => {
    const rule = {
      id: uuidv4(),
      conditions: conditions.map((cond, index) => ({
        ...cond,
        logic: index > 0 ? logicOperators[index - 1] : null
      })),
      actions
    };

    onSaveRules(rule);
    setConditionshow(false);
  };

  const renderValueInput = (condition) => {
    const field = fieldOptions.find(f => f.id === condition.field);

    if (!field || ['Is Filled', 'Is Empty'].includes(condition.state)) {
      return null;
    }

    switch (condition.fieldType) {
      case 'dropdown':
        return (
          <select
            value={condition.value}
            onChange={(e) => handleValueChange(condition.id, e.target.value)}
            className="w-full p-2 border rounded text-sm"
          >
            <option value="">Select value</option>
            {field.options.map((option, idx) => (
              <option key={idx} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'number':
        return (
          <input
            type="number"
            value={condition.value}
            onChange={(e) => handleValueChange(condition.id, e.target.value)}
            className="w-full p-2 border rounded text-sm"
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={condition.value}
            onChange={(e) => handleValueChange(condition.id, e.target.value)}
            className="w-full p-2 border rounded text-sm"
          />
        );

      case 'time':
        return (
          <input
            type="time"
            value={condition.value}
            onChange={(e) => handleValueChange(condition.id, e.target.value)}
            className="w-full p-2 border rounded text-sm"
          />
        );

      default:
        return (
          <input
            type="text"
            value={condition.value}
            onChange={(e) => handleValueChange(condition.id, e.target.value)}
            className="w-full p-2 border rounded text-sm"
          />
        );
    }
  };

  const handleDeleteRule = (ruleId) => {
    setFormRules(formRules.filter(rule => rule.id !== ruleId));
  };

  const getRuleDescription = (rule) => {
    const conditionDescriptions = rule.conditions.map((cond, idx) => {
      const field = fieldOptions.find(f => f.id === cond.field);
      const fieldLabel = field ? field.label : 'Unknown field';

      let description = `${fieldLabel} ${cond.state}`;
      if (cond.value) description += ` "${cond.value}"`;
      if (idx > 0) description = `${rule.conditions[idx].logic} ${description}`;

      return description;
    });

    const actionDescriptions = rule.actions.map(action => {
      const field = fieldOptions.find(f => f.id === action.target);
      return `${action.action} ${field?.label || 'Unknown field'}`;
    });

    return {
      id: rule.id,
      conditions: conditionDescriptions.join(' '),
      actions: actionDescriptions.join(', ')
    };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start py-10 z-50 overflow-auto">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 relative my-10">
        <button
          onClick={() => setConditionshow(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl"
        >
          &times;
        </button>

        <div className="flex items-start gap-3">
          <div className="w-1 bg-blue-500 rounded-full h-full mt-2" />
          <div className="flex-1">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-blue-800 flex items-center gap-2">
                <span className="bg-blue-500 p-2 rounded text-white">👁️</span>
                SHOW/HIDE FIELD
              </h2>
              <p className="text-sm text-gray-500">Change visibility of specific form fields</p>
            </div>

            {formRules.length > 0 && (
              <div className="mb-6 bg-gray-100 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">Existing Rules:</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {formRules.map((rule) => {
                    const { id, conditions, actions } = getRuleDescription(rule);
                    return (
                      <div key={id} className="p-3 bg-white rounded border border-gray-300 relative">
                        <button
                          onClick={() => handleDeleteRule(id)}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                          title="Delete rule"
                        >
                          ✕
                        </button>
                        <div className="font-mono text-sm">
                          IF {conditions}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          THEN {actions}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">IF</h3>

              {conditions.map((condition, index) => (
                <div key={condition.id} className="mb-4 border p-4 rounded relative">
                  <button
                    onClick={() => removeCondition(condition.id)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>

                  {index > 0 && (
                    <div className="mb-3">
                      <select
                        value={logicOperators[index - 1] || 'AND'}
                        onChange={(e) => handleLogicChange(index - 1, e.target.value)}
                        className="w-20 p-1 border rounded text-sm"
                      >
                        <option value="AND">AND</option>
                        <option value="OR">OR</option>
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">FIELD</label>
                      <select
                        value={condition.field}
                        onChange={(e) => handleFieldChange(condition.id, e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                      >
                        <option value="">Select Field</option>
                        {fieldOptions.map(field => (
                          <option key={field.id} value={field.id}>{field.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">STATE</label>
                      <select
                        value={condition.state}
                        onChange={(e) => handleStateChange(condition.id, e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                        disabled={!condition.field}
                      >
                        <option value="">Select State</option>
                        {condition.fieldType && getStateOptions(condition.fieldType).map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      {!['Is Filled', 'Is Empty'].includes(condition.state) && condition.fieldType && (
                        <>
                          <label className="block text-xs text-gray-500 mb-1">VALUE</label>
                          {renderValueInput(condition)}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addCondition}
                className="flex items-center gap-1 text-blue-500 hover:text-blue-700 text-sm"
              >
                <Plus size={16} /> Add Condition
              </button>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-gray-700 mb-2">THEN DO</h3>

              {actions.map(action => (
                <div key={action.id} className="mb-4 border p-4 rounded relative">
                  <button
                    onClick={() => removeAction(action.id)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">ACTION</label>
                      <select
                        value={action.action}
                        onChange={(e) => setActions(prev =>
                          prev.map(a =>
                            a.id === action.id ? { ...a, action: e.target.value } : a
                          )
                        )}
                        className="w-full p-2 border rounded text-sm"
                      >
                        <option value="Show">Show</option>
                        <option value="Hide">Hide</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">TARGET FIELD</label>
                      <select
                        value={action.target}
                        onChange={(e) => setActions(prev =>
                          prev.map(a =>
                            a.id === action.id ? { ...a, target: e.target.value } : a
                          )
                        )}
                        className="w-full p-2 border rounded text-sm"
                      >
                        <option value="">Select Field</option>
                        {fieldOptions.map(field => (
                          <option key={field.id} value={field.id}>{field.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addAction}
                className="flex items-center gap-1 text-blue-500 hover:text-blue-700 text-sm"
              >
                <Plus size={16} /> Add Action
              </button>
            </div>

            <div className="text-right mt-6">
              <button
                onClick={saveRules}
                className="bg-lime-600 hover:bg-lime-700 text-white font-bold py-2 px-6 rounded"
              >
                SAVE RULES
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EditFormPage = () => {
  const navigate = useNavigate();
  const { shareId } = useParams();
  const [formName, setFormName] = useState("Untitled Form");
  const [editingFormName, setEditingFormName] = useState(false);
  const [steps, setSteps] = useState([
    { id: "step1", name: "Step 1", elements: [] }
  ]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [activeElement, setActiveElement] = useState(null);
  const [draggedElementType, setDraggedElementType] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [elementStyles, setElementStyles] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const fileInputRef = useRef(null);
  const bannerFileInputRef = useRef(null);
  const [currentUpload, setCurrentUpload] = useState({ elementId: null, field: null });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formUrl, setFormUrl] = useState("");
  const [conditionsshow, setConditionshow] = useState(false);
  const [formRules, setFormRules] = useState([]);
  const [visibilityMap, setVisibilityMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formId, setFormId] = useState(null);

  const currentStep = steps[currentStepIndex];
  const currentElements = currentStep.elements;

  // Fetch form data when component mounts - FIXED VERSION
  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await fetch(`https://tableware-dweeb-estate.ngrok-free.dev/api/forms/shared/${shareId}`);
        if (!response.ok) {
          throw new Error('Failed to load form');
        }
        
        const data = await response.json();
        const formData = data.form;
        
        setFormId(formData.id);
        setFormName(formData.name);
        
        // Transform API data to match our component structure - FIXED VERSION
        const transformedSteps = formData.steps.map(step => ({
          id: `step-${step.id}`,
          name: step.name,
          elements: step.elements.map(element => {
            // Fix nested config structure
            let elementConfig = element.config;
            
            // If config is nested inside another config, extract it
            if (elementConfig && elementConfig.config) {
              elementConfig = elementConfig.config;
            }
            
            // If config is a string, parse it
            if (typeof elementConfig === 'string') {
              elementConfig = JSON.parse(elementConfig);
            }
            
            // Ensure we have proper element data
            const elementData = {
              id: elementConfig.id || element.id,
              type: elementConfig.type || element.type,
              ...elementConfig
            };
            
            // Initialize empty values for preview mode
            if (!elementData.value && ['full-name', 'email', 'phone', 'address'].includes(elementData.type)) {
              elementData.value = '';
            }
            
            return elementData;
          })
        }));

        setSteps(transformedSteps);
        
        // Set element styles 
        if (formData.elementStyles) {
          setElementStyles(formData.elementStyles);
        }
        
        // Set form rules - fix duplicate IDs and transform structure
        if (formData.rules) {
          const uniqueRules = formData.rules.map((rule, index) => ({
            id: rule.id || `rule-${index}-${Date.now()}`,
            conditions: rule.conditions.map(cond => ({
              id: `cond-${index}-${Date.now()}`,
              field: cond.field,
              state: cond.operator,
              value: cond.value || "",
              fieldType: cond.fieldType,
              logic: cond.logic || (index > 0 ? 'AND' : null)
            })),
            actions: rule.actions.map(action => ({
              id: `action-${index}-${Date.now()}`,
              action: action.action.charAt(0).toUpperCase() + action.action.slice(1), // Capitalize first letter
              target: action.target
            }))
          }));
          
          // Remove duplicates based on ID
          const seen = new Set();
          const dedupedRules = uniqueRules.filter(rule => {
            if (seen.has(rule.id)) {
              return false;
            }
            seen.add(rule.id);
            return true;
          });
          
          setFormRules(dedupedRules);
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchForm();
  }, [shareId]);

  const fieldOptions = useMemo(() => {
    return steps.flatMap(step =>
      step.elements
        .filter(el => [
          'full-name', 'email', 'phone', 'address',
          'date', 'time', 'signature', 'dropdown',
          'single-choice', 'multiple-choice', 'file-upload',
          'star-rating', 'scale-rating', 'aadhar', 'passport',
          'hyperlink', 'image-gallery', 'download-document', 'nearest-airport'
        ].includes(el.type))
        .map(el => {
          const baseField = {
            id: el.id,
            label: el.label || el.type.replace(/-/g, ' '),
            options: []
          };

          switch (el.type) {
            case 'dropdown':
            case 'single-choice':
            case 'multiple-choice':
              return {
                ...baseField,
                type: 'choice',
                options: el.options || []
              };

            case 'star-rating':
            case 'scale-rating':
              return {
                ...baseField,
                type: 'number'
              };

            case 'date':
              return {
                ...baseField,
                type: 'date'
              };

            case 'time':
              return {
                ...baseField,
                type: 'time'
              };

            case 'file-upload':
            case 'signature':
            case 'image-gallery':
            case 'download-document':
              return {
                ...baseField,
                type: 'file'
              };

            case 'nearest-airport':
              return {
                ...baseField,
                type: 'dropdown',
                options: el.airportOptions || [
                  "Indira Gandhi International Airport (DEL)",
                  "Chhatrapati Shivaji Maharaj International Airport (BOM)",
                  "Kempegowda International Airport (BLR)"
                ]
              };

            default:
              return {
                ...baseField,
                type: 'text'
              };
          }
        })
    );
  }, [steps]);

  useEffect(() => {
    if (previewMode) {
      const initialVisibility = {};

      steps.forEach(step => {
        step.elements.forEach(el => {
          initialVisibility[el.id] = true; // Changed to true by default
        });
      });

      setVisibilityMap(initialVisibility);
      applyRules();
    }
  }, [previewMode, steps]);

  // Fixed getFieldValue function
  const getFieldValue = (element) => {
    if (!element) return null;

    switch (element.type) {
      case "full-name":
      case "email":
      case "phone":
        return element.value || "";
      case "date":
        return element.selectedDate || "";
      case "time":
        return element.selectedTime || "";
      case "address":
        return element.street1 || "";
      case "aadhar":
        return element.aadharNumber || "";
      case "passport":
        return element.passportNumber || "";
      case "file-upload":
        return element.file ? true : false;
      case "signature":
        return element.signatureData ? true : false;
      case "star-rating":
        return element.rating || 0;
      case "scale-rating":
        return element.value || 0;
      case "dropdown":
      case "single-choice":
        return element.selectedOption || "";
      case "multiple-choice":
        return element.selectedOptions || [];
      case "nearest-airport":
        return element.selectedAirport || "";
      default:
        return element.value || "";
    }
  };

  // Fixed evaluateCondition function
  const evaluateCondition = (condition) => {
    if (!condition.field) return false;

    let currentValue = null;
    
    // Find the element across all steps
    for (const step of steps) {
      const element = step.elements.find(el => el.id === condition.field);
      if (element) {
        currentValue = getFieldValue(element);
        break;
      }
    }

    // Handle empty/undefined values properly
    if (currentValue === null || currentValue === undefined || currentValue === "") {
      // For "Is Empty" condition, return true if value is empty
      if (condition.state === "Is Empty") {
        return true;
      }
      // For "Is Filled" condition, return false if value is empty
      if (condition.state === "Is Filled") {
        return false;
      }
      // For other conditions, return false if value is empty
      return false;
    }

    // Handle date/time comparisons
    if (condition.fieldType === 'date' || condition.fieldType === 'time') {
      const currentDate = new Date(currentValue);
      const conditionDate = new Date(condition.value);

      switch (condition.state) {
        case "Is Filled":
          return !!currentValue && currentValue !== "";
        case "Is Empty":
          return !currentValue || currentValue === "";
        case "Equals":
          return currentDate.getTime() === conditionDate.getTime();
        case "Not Equals":
          return currentDate.getTime() !== conditionDate.getTime();
        case "Greater Than":
          return currentDate > conditionDate;
        case "Less Than":
          return currentDate < conditionDate;
        case "Greater or Equal":
          return currentDate >= conditionDate;
        case "Less or Equal":
          return currentDate <= conditionDate;
        default:
          return false;
      }
    }

    // Handle text/number comparisons
    switch (condition.state) {
      case "Is Filled":
        return !!currentValue && currentValue !== "";
      case "Is Empty":
        return !currentValue || currentValue === "";
      case "Equals":
        return currentValue == condition.value;
      case "Not Equals":
        return currentValue != condition.value;
      case "Greater Than":
        return parseFloat(currentValue) > parseFloat(condition.value);
      case "Less Than":
        return parseFloat(currentValue) < parseFloat(condition.value);
      case "Greater or Equal":
        return parseFloat(currentValue) >= parseFloat(condition.value);
      case "Less or Equal":
        return parseFloat(currentValue) <= parseFloat(condition.value);
      default:
        return false;
    }
  };

  const evaluateRule = (rule) => {
    if (!rule || !rule.conditions || rule.conditions.length === 0) {
      return false;
    }

    let result = evaluateCondition(rule.conditions[0]);

    for (let i = 1; i < rule.conditions.length; i++) {
      const conditionResult = evaluateCondition(rule.conditions[i]);
      const logicOp = rule.conditions[i].logic;

      if (logicOp === "AND") {
        result = result && conditionResult;
      } else if (logicOp === "OR") {
        result = result || conditionResult;
      }
    }

    return result;
  };

  // Fixed applyRules function
  const applyRules = () => {
    if (!previewMode || !formRules || formRules.length === 0) {
      const showAll = {};
      steps.forEach(step => {
        step.elements.forEach(el => {
          showAll[el.id] = true;
        });
      });
      setVisibilityMap(showAll);
      return;
    }

    const newVisibilityMap = { ...visibilityMap };

    // Initialize all elements as visible by default
    steps.forEach(step => {
      step.elements.forEach(el => {
        if (newVisibilityMap[el.id] === undefined) {
          newVisibilityMap[el.id] = true;
        }
      });
    });

    // Apply each rule
    formRules.forEach(rule => {
      const ruleResult = evaluateRule(rule);

      if (ruleResult) {
        rule.actions.forEach(action => {
          if (action.target) {
            newVisibilityMap[action.target] = action.action === "Show";
          }
        });
      } else {
        // If rule condition is false, hide the target for "Show" actions
        rule.actions.forEach(action => {
          if (action.target && action.action === "Show") {
            newVisibilityMap[action.target] = false;
          }
        });
      }
    });

    setVisibilityMap(newVisibilityMap);
  };

  useEffect(() => {
    if (previewMode) {
      applyRules();
    }
  }, [previewMode, steps, formRules]);

  const handleDragStart = (elementType) => {
    setDraggedElementType(elementType);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!draggedElementType || previewMode) return;

    const newElement = createFormElement(draggedElementType);
    const updatedSteps = [...steps];
    updatedSteps[currentStepIndex].elements = [...currentElements, newElement];
    setSteps(updatedSteps);
    setActiveElement(newElement.id);
    setDraggedElementType(null);

    // Initialize visibility for new element if in preview mode
    if (previewMode) {
      setVisibilityMap(prev => ({
        ...prev,
        [newElement.id]: false
      }));
    }
  };

  const handleClickAdd = (elementType) => {
    if (previewMode) return;
    const newElement = createFormElement(elementType);
    const updatedSteps = [...steps];
    updatedSteps[currentStepIndex].elements = [...currentElements, newElement];
    setSteps(updatedSteps);
    setActiveElement(newElement.id);

    // Initialize visibility for new element if in preview mode
    if (previewMode) {
      setVisibilityMap(prev => ({
        ...prev,
        [newElement.id]: false
      }));
    }
  };

  // Fixed createFormElement function with proper value initialization
  const createFormElement = (type) => {
    const id = Date.now().toString();

    // Common base structure
    const baseElement = {
      id,
      type,
      description: "",
      value: "" // Add default value
    };

    // Initialize visibility for new elements
    if (previewMode) {
      setVisibilityMap(prev => ({
        ...prev,
        [id]: false
      }));
    }

    switch (type) {
      case "heading":
        return { ...baseElement, text: "Heading Text", level: "h2" };
      case "full-name":
        return {
          ...baseElement,
          label: "Full Name",
          placeholder: "Enter your full name",
          required: false,
          value: "" // Ensure value exists
        };
      case "email":
        return {
          ...baseElement,
          label: "Email",
          placeholder: "email@example.com",
          required: false,
          value: "" // Ensure value exists
        };
      case "nearest-airport":
        return {
          ...baseElement,
          label: "Nearest Airport",
          address: "",
          selectedAirport: "",
          airportOptions: [
            "Indira Gandhi International Airport (DEL)",
            "Chhatrapati Shivaji Maharaj International Airport (BOM)",
            "Kempegowda International Airport (BLR)"
          ],
          distanceKm: "",
          description: "",
          required: false,
          value: "" // Ensure value exists
        };
      case "address":
        return {
          ...baseElement,
          label: "Address",
          street1: "",
          street2: "",
          city: "",
          state: "",
          postalCode: "",
          description: "",
          required: false,
          value: "" // Ensure value exists
        };
      case "phone":
        return {
          ...baseElement,
          label: "Phone",
          placeholder: "(123) 456-7890",
          description: "",
          required: false,
          value: "" // Ensure value exists
        };
      case "date":
        return {
          ...baseElement,
          label: "Date",
          selectedDate: "",
          description: "",
          required: false,
          value: "" // Ensure value exists
        };
      case "download-document":
        return {
          ...baseElement,
          label: "Download Document",
          document: null,
          description: "",
          buttonText: "Download",
          required: false,
          value: "" // Ensure value exists
        };
      case "time":
        return {
          ...baseElement,
          label: "Time",
          selectedTime: "",
          description: "",
          required: false,
          value: "" // Ensure value exists
        };
      case "signature":
        return {
          ...baseElement,
          label: "Signature",
          signatureData: null,
          description: "",
          required: false,
          value: "" // Ensure value exists
        };
      case "paragraph":
        return {
          ...baseElement,
          content: "Paragraph text...",
          description: ""
        };
      case "dropdown":
        return {
          ...baseElement,
          label: "Dropdown",
          options: ["Option 1"],
          description: "",
          required: false,
          value: "" // Ensure value exists
        };
      case "single-choice":
        return {
          ...baseElement,
          label: "Single Choice",
          options: ["Option 1"],
          description: "",
          required: false,
          value: "" // Ensure value exists
        };
      case "multiple-choice":
        return {
          ...baseElement,
          label: "Multiple Choice",
          options: ["Option 1"],
          description: "",
          required: false,
          value: "" // Ensure value exists
        };
      case "file-upload":
        return {
          ...baseElement,
          label: "File Upload",
          file: null,
          description: "",
          required: false,
          value: "" // Ensure value exists
        };
      case "star-rating":
        return {
          ...baseElement,
          label: "Star Rating",
          rating: 0,
          maxRating: 5,
          description: "",
          required: false,
          value: "" // Ensure value exists
        };
      case "scale-rating":
        return {
          ...baseElement,
          label: "Scale Rating",
          value: 5,
          min: 1,
          max: 10,
          description: "",
          required: false
        };
      case "divider":
        return {
          ...baseElement,
          description: ""
        };
      case "aadhar":
        return {
          ...baseElement,
          label: "Aadhar Card",
          aadharNumber: "",
          name: "",
          dob: "",
          gender: "",
          address: "",
          frontImage: null,
          backImage: null,
          description: "",
          required: false,
          value: "" // Ensure value exists
        };
      case "passport":
        return {
          ...baseElement,
          label: "Passport",
          passportNumber: "",
          fullName: "",
          nationality: "",
          dob: "",
          placeOfBirth: "",
          issueDate: "",
          expiryDate: "",
          frontImage: null,
          backImage: null,
          description: "",
          required: false,
          value: "" // Ensure value exists
        };
      case "banner":
        return {
          ...baseElement,
          label: "Banner",
          bannerImage: null,
          height: 200,
          description: ""
        };
      case "hyperlink":
        return {
          ...baseElement,
          text: "Click here",
          url: "https://example.com",
          description: "",
          openInNewTab: false
        };
      case "image-gallery":
        return {
          ...baseElement,
          label: "Image Gallery",
          images: [],
          description: "",
          layout: "grid",
          columns: 3
        };
      case "ocr-aadhar":
        return {
          ...baseElement,
          label: "OCR Aadhar Card",
          aadharNumber: "",
          name: "",
          dob: "",
          gender: "",
          address: "",
          frontImage: null,
          backImage: null,
          description: "",
          required: false,
          value: "" // Ensure value exists
        };

      case "ocr-password":
        return {
          ...baseElement,
          label: "OCR Password",
          passportNumber: "",
          fullName: "",
          nationality: "",
          dob: "",
          placeOfBirth: "",
          issueDate: "",
          expiryDate: "",
          frontImage: null,
          backImage: null,
          description: "",
          required: false,
          value: "" // Ensure value exists
        };
      default:
        return {
          ...baseElement,
          label: type,
          description: "",
          required: false,
          value: "" // Ensure value exists
        };
    }
  };

  const handleElementChange = (id, updates) => {
    const updatedSteps = [...steps];
    const stepIndex = currentStepIndex;
    const elementIndex = updatedSteps[stepIndex].elements.findIndex(el => el.id === id);

    if (elementIndex !== -1) {
      updatedSteps[stepIndex].elements[elementIndex] = {
        ...updatedSteps[stepIndex].elements[elementIndex],
        ...updates
      };
      setSteps(updatedSteps);

      // If this is a new element being added, initialize its visibility
      if (!visibilityMap[id]) {
        setVisibilityMap(prev => ({
          ...prev,
          [id]: false
        }));
      }

      if (previewMode) {
        applyRules();
      }
    }
  };

  const handleStyleChange = (id, styleUpdates) => {
    setElementStyles(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        ...styleUpdates
      }
    }));
  };

  const handleMoveElement = (id, direction) => {
    if (previewMode) return;

    const updatedSteps = [...steps];
    const stepIndex = currentStepIndex;
    const elements = [...updatedSteps[stepIndex].elements];
    const index = elements.findIndex((el) => el.id === id);

    if ((direction === "up" && index === 0) ||
      (direction === "down" && index === elements.length - 1)) {
      return;
    }

    const newIndex = direction === "up" ? index - 1 : index + 1;
    [elements[index], elements[newIndex]] = [elements[newIndex], elements[index]];

    updatedSteps[stepIndex].elements = elements;
    setSteps(updatedSteps);
  };

  const handleDeleteElement = (id) => {
    if (previewMode) return;

    const updatedSteps = [...steps];
    const stepIndex = currentStepIndex;
    updatedSteps[stepIndex].elements = updatedSteps[stepIndex].elements.filter(el => el.id !== id);

    setSteps(updatedSteps);
    if (activeElement === id) setActiveElement(null);

    setElementStyles(prev => {
      const newStyles = { ...prev };
      delete newStyles[id];
      return newStyles;
    });

    // Remove from visibility map if in preview mode
    if (previewMode) {
      setVisibilityMap(prev => {
        const newVisibility = { ...prev };
        delete newVisibility[id];
        return newVisibility;
      });
    }
  };

  const handleFileUpload = (e, elementId, field) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleElementChange(elementId, {
          [field]: event.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadButtonClick = (elementId, field) => {
    setCurrentUpload({ elementId, field });

    const inputRef = field === 'bannerImage' ? bannerFileInputRef : fileInputRef;

    if (inputRef.current) {
      inputRef.current.click();
    } else {
      console.error("File input ref is not available");
    }
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (!files || !currentUpload.elementId || !currentUpload.field) return;

    if (currentUpload.field === 'images') {
      const newImages = [];
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          newImages.push({
            url: event.target.result,
            name: file.name,
            size: file.size,
            type: file.type
          });
          if (newImages.length === files.length) {
            const element = steps.flatMap(step => step.elements)
              .find(el => el.id === currentUpload.elementId);
            if (element) {
              handleElementChange(currentUpload.elementId, {
                images: [...element.images, ...newImages]
              });
            }
          }
        };
        reader.readAsDataURL(file);
      });
    } else {
      const file = files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          handleElementChange(currentUpload.elementId, {
            [currentUpload.field]: {
              url: event.target.result,
              name: file.name,
              size: file.size,
              type: file.type
            }
          });
        };
        reader.readAsDataURL(file);
      }
    }

    e.target.value = '';
  };

// SignaturePad Component - CORRECTED VERSION
const SignaturePad = ({ element }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [prevPos, setPrevPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (element.signatureData) {
      const img = new Image();
      img.src = element.signatureData;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
    }
  }, [element.signatureData]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setPrevPos({ x, y });

    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();

    setPrevPos({ x, y });
  };

  const endDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL();
    handleElementChange(element.id, { signatureData: dataURL });
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    handleElementChange(element.id, { signatureData: null });
  };

  return (
    <div className="space-y-2">
      <canvas
        ref={canvasRef}
        width={400}
        height={200}
        className="border-2 border-dashed border-gray-300 rounded-lg w-full cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
      />
      <button
        onClick={clearSignature}
        className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm"
      >
        Clear Signature
      </button>
    </div>
  );
};

  const StylePanel = ({ element }) => {
    if (!element) return null;

    const currentStyles = elementStyles[element.id] || {};

    return (
      <div className="w-72 bg-gray-800 text-white p-4 overflow-y-auto">
        <h3 className="font-bold text-lg mb-4">Element Styles</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Font Family</label>
            <select
              value={currentStyles.fontFamily || 'inherit'}
              onChange={(e) => handleStyleChange(element.id, { fontFamily: e.target.value })}
              className="w-full p-2 bg-gray-700 rounded text-sm"
            >
              <option value="inherit">Inherit</option>
              <option value="Arial, sans-serif">Arial</option>
              <option value="Helvetica, sans-serif">Helvetica</option>
              <option value="Times New Roman, serif">Times New Roman</option>
              <option value="Courier New, monospace">Courier New</option>
              <option value="Georgia, serif">Georgia</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Font Size</label>
            <div className="flex items-center">
              <input
                type="range"
                min="10"
                max="32"
                value={currentStyles.fontSize ? parseInt(currentStyles.fontSize) : 16}
                onChange={(e) => handleStyleChange(element.id, { fontSize: `${e.target.value}px` })}
                className="flex-1"
              />
              <span className="ml-2 text-sm w-8">
                {currentStyles.fontSize ? parseInt(currentStyles.fontSize) : 16}px
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Text Color</label>
            <div className="flex items-center">
              <input
                type="color"
                value={currentStyles.color || '#000000'}
                onChange={(e) => handleStyleChange(element.id, { color: e.target.value })}
                className="w-8 h-8"
              />
              <span className="ml-2 text-sm">
                {currentStyles.color || '#000000'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Background</label>
            <div className="flex items-center">
              <input
                type="color"
                value={currentStyles.backgroundColor || '#ffffff'}
                onChange={(e) => handleStyleChange(element.id, { backgroundColor: e.target.value })}
                className="w-8 h-8"
              />
              <span className="ml-2 text-sm">
                {currentStyles.backgroundColor || '#ffffff'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Border</label>
            <div className="grid grid-cols-3 gap-2">
              <select
                value={currentStyles.borderWidth || '1px'}
                onChange={(e) => handleStyleChange(element.id, { borderWidth: e.target.value })}
                className="p-1 bg-gray-700 rounded text-sm"
              >
                <option value="0">None</option>
                <option value="1px">Thin</option>
                <option value="2px">Medium</option>
                <option value="3px">Thick</option>
              </select>
              <select
                value={currentStyles.borderStyle || 'solid'}
                onChange={(e) => handleStyleChange(element.id, { borderStyle: e.target.value })}
                className="p-1 bg-gray-700 rounded text-sm"
              >
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
              </select>
              <input
                type="color"
                value={currentStyles.borderColor || '#cccccc'}
                onChange={(e) => handleStyleChange(element.id, { borderColor: e.target.value })}
                className="w-full h-8"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Padding</label>
            <div className="flex items-center">
              <input
                type="range"
                min="0"
                max="30"
                value={currentStyles.padding ? parseInt(currentStyles.padding) : 8}
                onChange={(e) => handleStyleChange(element.id, { padding: `${e.target.value}px` })}
                className="flex-1"
              />
              <span className="ml-2 text-sm w-8">
                {currentStyles.padding ? parseInt(currentStyles.padding) : 8}px
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Corner Radius</label>
            <div className="flex items-center">
              <input
                type="range"
                min="0"
                max="20"
                value={currentStyles.borderRadius ? parseInt(currentStyles.borderRadius) : 4}
                onChange={(e) => handleStyleChange(element.id, { borderRadius: `${e.target.value}px` })}
                className="flex-1"
              />
              <span className="ml-2 text-sm w-8">
                {currentStyles.borderRadius ? parseInt(currentStyles.borderRadius) : 4}px
              </span>
            </div>
          </div>

          <button
            onClick={() => setElementStyles(prev => {
              const newStyles = { ...prev };
              delete newStyles[element.id];
              return newStyles;
            })}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded text-sm"
          >
            Reset Styles
          </button>
        </div>
      </div>
    );
  };

  const renderElementEditor = (element) => {
    const commonDescriptionField = (
      <div className="mt-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description (help text)
        </label>
        <input
          type="text"
          value={element.description}
          onChange={(e) => handleElementChange(element.id, { description: e.target.value })}
          className="w-full p-2 border rounded text-sm"
          placeholder="Add description or help text"
        />
      </div>
    );

    const requiredField = (
      <div className="mt-3 flex items-center">
        <input
          type="checkbox"
          id={`required-${element.id}`}
          checked={element.required || false}
          onChange={(e) => handleElementChange(element.id, { required: e.target.checked })}
          className="mr-2"
        />
        <label htmlFor={`required-${element.id}`} className="text-sm font-medium text-gray-700">
          Required field
        </label>
      </div>
    );

    switch (element.type) {
      case "heading":
        return (
          <div className="space-y-3">
            <input
              type="text"
              value={element.text}
              onChange={(e) => handleElementChange(element.id, { text: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="Heading text"
            />
            <select
              value={element.level}
              onChange={(e) => handleElementChange(element.id, { level: e.target.value })}
              className="p-2 border rounded"
            >
              <option value="h1">H1</option>
              <option value="h2">H2</option>
              <option value="h3">H3</option>
            </select>
            {commonDescriptionField}
          </div>
        );

      case "email":
      case "phone":
      case "full-name":
        return (
          <div className="space-y-3">
            <input
              type="text"
              value={element.label}
              onChange={(e) => handleElementChange(element.id, { label: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="Label"
            />
            <input
              type="text"
              value={element.placeholder}
              onChange={(e) => handleElementChange(element.id, { placeholder: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="Placeholder"
            />
            {commonDescriptionField}
            {requiredField}
          </div>
        );

      case "nearest-airport":
        return (
          <div className="space-y-3">
            <input
              type="text"
              value={element.label}
              onChange={(e) => handleElementChange(element.id, { label: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="Label"
            />

            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <input
                type="text"
                value={element.address}
                onChange={(e) => handleElementChange(element.id, { address: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Enter airport address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Airport</label>
              <select
                value={element.selectedAirport}
                onChange={(e) => handleElementChange(element.id, { selectedAirport: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Airport</option>
                {element.airportOptions.map((airport, idx) => (
                  <option key={idx} value={airport}>{airport}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Distance (KM)</label>
              <input
                type="number"
                value={element.distanceKm}
                onChange={(e) => handleElementChange(element.id, { distanceKm: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Enter distance"
                min="0"
              />
            </div>

            {commonDescriptionField}
            {requiredField}
          </div>
        );
      case "download-document":
        return (
          <div className="space-y-3">
            <input
              type="text"
              value={element.label}
              onChange={(e) => handleElementChange(element.id, { label: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="Label"
            />
            <input
              type="text"
              value={element.buttonText}
              onChange={(e) => handleElementChange(element.id, { buttonText: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="Button Text"
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileUpload(e, element.id, 'document')}
              className="hidden"
            />
            <button
              onClick={() => handleUploadButtonClick(element.id, 'document')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full"
            >
              {element.document ? "Change Document" : "Upload Document"}
            </button>
            {element.document && (
              <div className="mt-2 p-2 bg-gray-100 rounded">
                <div className="flex justify-between items-center">
                  <span className="truncate">{element.document.name}</span>
                  <button
                    onClick={() => handleElementChange(element.id, { document: null })}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
            {commonDescriptionField}
          </div>
        );

      case "address":
        return (
          <div className="space-y-3">
            <input
              type="text"
              value={element.label}
              onChange={(e) => handleElementChange(element.id, { label: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="Label"
            />
            <div className="space-y-2">
              <input
                type="text"
                value={element.street1}
                onChange={(e) => handleElementChange(element.id, { street1: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Street Address"
              />
              <input
                type="text"
                value={element.street2}
                onChange={(e) => handleElementChange(element.id, { street2: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Street Address Line 2"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={element.city}
                  onChange={(e) => handleElementChange(element.id, { city: e.target.value })}
                  className="p-2 border rounded"
                  placeholder="City"
                />
                <input
                  type="text"
                  value={element.state}
                  onChange={(e) => handleElementChange(element.id, { state: e.target.value })}
                  className="p-2 border rounded"
                  placeholder="State/Province"
                />
              </div>
              <input
                type="text"
                value={element.postalCode}
                onChange={(e) => handleElementChange(element.id, { postalCode: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Postal/Zip Code"
              />
            </div>
            {commonDescriptionField}
            {requiredField}
          </div>
        );

      case "aadhar":
        return (
          <div className="space-y-3">
            <input
              type="text"
              value={element.label}
              onChange={(e) => handleElementChange(element.id, { label: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="Label"
            />
            <div className="space-y-2">
              <input
                type="text"
                value={element.aadharNumber}
                onChange={(e) => handleElementChange(element.id, { aadharNumber: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Aadhar Number (12 digits)"
                maxLength="12"
              />
              <input
                type="text"
                value={element.name}
                onChange={(e) => handleElementChange(element.id, { name: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Full Name as on Aadhar"
              />
              <input
                type="date"
                value={element.dob}
                onChange={(e) => handleElementChange(element.id, { dob: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Date of Birth"
              />
              <select
                value={element.gender}
                onChange={(e) => handleElementChange(element.id, { gender: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <textarea
                value={element.address}
                onChange={(e) => handleElementChange(element.id, { address: e.target.value })}
                className="w-full p-2 border rounded"
                rows={3}
                placeholder="Address as on Aadhar"
              />

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <div className="font-medium mb-2">Front Image</div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, element.id, 'frontImage')}
                    className="hidden"
                  />
                  {element.frontImage ? (
                    <div className="relative">
                      <img
                        src={element.frontImage}
                        alt="Aadhar Front"
                        className="w-full h-40 object-contain border rounded-lg"
                      />
                      <button
                        onClick={() => handleElementChange(element.id, { frontImage: null })}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUploadButtonClick(element.id, 'frontImage')}
                      className="w-full bg-gray-100 hover:bg-gray-200 p-4 rounded-lg border-2 border-dashed"
                    >
                      Upload Front
                    </button>
                  )}
                </div>

                <div>
                  <div className="font-medium mb-2">Back Image</div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, element.id, 'backImage')}
                    className="hidden"
                  />
                  {element.backImage ? (
                    <div className="relative">
                      <img
                        src={element.backImage}
                        alt="Aadhar Back"
                        className="w-full h-40 object-contain border rounded-lg"
                      />
                      <button
                        onClick={() => handleElementChange(element.id, { backImage: null })}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUploadButtonClick(element.id, 'backImage')}
                      className="w-full bg-gray-100 hover:bg-gray-200 p-4 rounded-lg border-2 border-dashed"
                    >
                      Upload Back
                    </button>
                  )}
                </div>
              </div>
            </div>
            {commonDescriptionField}
            {requiredField}
          </div>
        );

      case "passport":
        return (
          <div className="space-y-3">
            <input
              type="text"
              value={element.label}
              onChange={(e) => handleElementChange(element.id, { label: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="Label"
            />
            <div className="space-y-2">
              <input
                type="text"
                value={element.passportNumber}
                onChange={(e) => handleElementChange(element.id, { passportNumber: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Passport Number"
              />
              <input
                type="text"
                value={element.fullName}
                onChange={(e) => handleElementChange(element.id, { fullName: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Full Name as on Passport"
              />
              <input
                type="text"
                value={element.nationality}
                onChange={(e) => handleElementChange(element.id, { nationality: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Nationality"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={element.dob}
                  onChange={(e) => handleElementChange(element.id, { dob: e.target.value })}
                  className="p-2 border rounded"
                  placeholder="Date of Birth"
                />
                <input
                  type="text"
                  value={element.placeOfBirth}
                  onChange={(e) => handleElementChange(element.id, { placeOfBirth: e.target.value })}
                  className="p-2 border rounded"
                  placeholder="Place of Birth"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={element.issueDate}
                  onChange={(e) => handleElementChange(element.id, { issueDate: e.target.value })}
                  className="p-2 border rounded"
                  placeholder="Issue Date"
                />
                <input
                  type="date"
                  value={element.expiryDate}
                  onChange={(e) => handleElementChange(element.id, { expiryDate: e.target.value })}
                  className="p-2 border rounded"
                  placeholder="Expiry Date"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <div className="font-medium mb-2">Front Image</div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, element.id, 'frontImage')}
                    className="hidden"
                  />
                  {element.frontImage ? (
                    <div className="relative">
                      <img
                        src={element.frontImage}
                        alt="Passport Front"
                        className="w-full h-40 object-contain border rounded-lg"
                      />
                      <button
                        onClick={() => handleElementChange(element.id, { frontImage: null })}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUploadButtonClick(element.id, 'frontImage')}
                      className="w-full bg-gray-100 hover:bg-gray-200 p-4 rounded-lg border-2 border-dashed"
                    >
                      Upload Front
                    </button>
                  )}
                </div>

                <div>
                  <div className="font-medium mb-2">Back Image</div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, element.id, 'backImage')}
                    className="hidden"
                  />
                  {element.backImage ? (
                    <div className="relative">
                      <img
                        src={element.backImage}
                        alt="Passport Back"
                        className="w-full h-40 object-contain border rounded-lg"
                      />
                      <button
                        onClick={() => handleElementChange(element.id, { backImage: null })}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUploadButtonClick(element.id, 'backImage')}
                      className="w-full bg-gray-100 hover:bg-gray-200 p-4 rounded-lg border-2 border-dashed"
                    >
                      Upload Back
                    </button>
                  )}
                </div>
              </div>
            </div>
            {commonDescriptionField}
            {requiredField}
          </div>
        );

      case "dropdown":
        return (
          <div className="space-y-3">
            <input
              type="text"
              value={element.label}
              onChange={(e) => handleElementChange(element.id, { label: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="Label"
            />
            <div className="space-y-2">
              {element.options.map((option, idx) => (
                <div key={idx} className="flex items-center">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...element.options];
                      newOptions[idx] = e.target.value;
                      handleElementChange(element.id, { options: newOptions });
                    }}
                    className="flex-1 p-2 border rounded"
                  />
                  <button
                    className="ml-2 text-red-500 hover:text-red-700"
                    onClick={() => {
                      const newOptions = element.options.filter((_, i) => i !== idx);
                      handleElementChange(element.id, { options: newOptions });
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                className="text-blue-500 hover:text-blue-700"
                onClick={() => {
                  handleElementChange(element.id, {
                    options: [...element.options, `Option ${element.options.length + 1}`],
                  });
                }}
              >
                + Add Option
              </button>
            </div>
            {commonDescriptionField}
            {requiredField}
          </div>
        );

      case "single-choice":
      case "multiple-choice":
        return (
          <div className="space-y-3">
            <input
              type="text"
              value={element.label}
              onChange={(e) => handleElementChange(element.id, { label: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="Label"
            />
            <div className="space-y-2">
              {element.options.map((option, idx) => (
                <div key={idx} className="flex items-center">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...element.options];
                      newOptions[idx] = e.target.value;
                      handleElementChange(element.id, { options: newOptions });
                    }}
                    className="flex-1 p-2 border rounded"
                  />
                  <button
                    className="ml-2 text-red-500 hover:text-red-700"
                    onClick={() => {
                      const newOptions = element.options.filter((_, i) => i !== idx);
                      handleElementChange(element.id, { options: newOptions });
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                className="text-blue-500 hover:text-blue-700"
                onClick={() => {
                  handleElementChange(element.id, {
                    options: [...element.options, `Option ${element.options.length + 1}`],
                  });
                }}
              >
                + Add Option
              </button>
            </div>
            {commonDescriptionField}
            {requiredField}
          </div>
        );

      case "paragraph":
        return (
          <div className="space-y-3">
            <textarea
              value={element.content}
              onChange={(e) => handleElementChange(element.id, { content: e.target.value })}
              className="w-full p-2 border rounded"
              rows={3}
              placeholder="Paragraph text..."
            />
            {commonDescriptionField}
          </div>
        );

      case "date":
        return (
          <div className="space-y-3">
            <input
              type="text"
              value={element.label}
              onChange={(e) => handleElementChange(element.id, { label: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="Label"
            />
            <input
              type="date"
              value={element.selectedDate || ""}
              onChange={(e) => handleElementChange(element.id, { selectedDate: e.target.value })}
              className="w-full p-2 border rounded"
            />
            {commonDescriptionField}
            {requiredField}
          </div>
        );

      case "time":
        return (
          <div className="space-y-3">
            <input
              type="text"
              value={element.label}
              onChange={(e) => handleElementChange(element.id, { label: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="Label"
            />
            <input
              type="time"
              value={element.selectedTime || ""}
              onChange={(e) => handleElementChange(element.id, { selectedTime: e.target.value })}
              className="w-full p-2 border rounded"
            />
            {commonDescriptionField}
            {requiredField}
          </div>
        );

      case "signature":
  return (
    <div className="space-y-3">
      <input
        type="text"
        value={element.label}
        onChange={(e) => handleElementChange(element.id, { label: e.target.value })}
        className="w-full p-2 border rounded"
        placeholder="Label"
      />
      <SignaturePad element={element} />
      {commonDescriptionField}
      {requiredField}
    </div>
  );

      case "file-upload":
        return (
          <div className="space-y-3">
            <input
              type="text"
              value={element.label}
              onChange={(e) => handleElementChange(element.id, { label: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="Label"
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileUpload(e, element.id, 'file')}
              className="hidden"
            />
            <button
              onClick={() => handleUploadButtonClick(element.id, 'file')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              {element.file ? element.file.name : "Choose File"}
            </button>
            {element.file && (
              <button
                onClick={() => handleElementChange(element.id, { file: null })}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                Remove File
              </button>
            )}
            {commonDescriptionField}
            {requiredField}
          </div>
        );

      case "star-rating":
        return (
          <div className="space-y-3">
            <input
              type="text"
              value={element.label}
              onChange={(e) => handleElementChange(element.id, { label: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="Label"
            />
            <div className="flex items-center">
              {[...Array(element.maxRating || 5)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleElementChange(element.id, { rating: i + 1 })}
                  className="text-2xl mr-1"
                >
                  {i < element.rating ? "★" : "☆"}
                </button>
              ))}
            </div>
            <div className="flex items-center">
              <span className="mr-2">Max Rating:</span>
              <input
                type="number"
                min="1"
                max="10"
                value={element.maxRating || 5}
                onChange={(e) =>
                  handleElementChange(element.id, { maxRating: parseInt(e.target.value) || 5 })
                }
                className="w-16 p-1 border rounded"
              />
            </div>
            {commonDescriptionField}
            {requiredField}
          </div>
        );

      case "scale-rating":
        return (
          <div className="space-y-3">
            <input
              type="text"
              value={element.label}
              onChange={(e) => handleElementChange(element.id, { label: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="Label"
            />
            <div className="flex items-center justify-between">
              <span>{element.min || 1}</span>
              <input
                type="range"
                min={element.min || 1}
                max={element.max || 10}
                value={element.value || 5}
                onChange={(e) =>
                  handleElementChange(element.id, { value: parseInt(e.target.value) })
                }
                className="w-full mx-2"
              />
              <span>{element.max || 10}</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">Min:</span>
              <input
                type="number"
                min="1"
                max={element.max || 10}
                value={element.min || 1}
                onChange={(e) =>
                  handleElementChange(element.id, { min: parseInt(e.target.value) || 1 })
                }
                className="w-16 p-1 border rounded mr-4"
              />
              <span className="mr-2">Max:</span>
              <input
                type="number"
                min={element.min || 1}
                max="100"
                value={element.max || 10}
                onChange={(e) =>
                  handleElementChange(element.id, { max: parseInt(e.target.value) || 10 })
                }
                className="w-16 p-1 border rounded"
              />
            </div>
            {commonDescriptionField}
            {requiredField}
          </div>
        );

      case "banner":
        return (
          <div className="space-y-3">
            <input
              type="text"
              value={element.label}
              onChange={(e) => handleElementChange(element.id, { label: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="Label"
            />

            <div>
              <label className="block text-sm font-medium mb-1">
                Banner Height: {element.height}px
              </label>
              <input
                type="range"
                min="100"
                max="500"
                value={element.height}
                onChange={(e) => handleElementChange(element.id, { height: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            <input
              type="file"
              ref={bannerFileInputRef}
              onChange={(e) => handleFileUpload(e, element.id, 'bannerImage')}
              accept="image/*"
              className="hidden"
            />

            <button
              onClick={() => handleUploadButtonClick(element.id, 'bannerImage')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full"
            >
              {element.bannerImage ? "Change Banner" : "Upload Banner"}
            </button>

            {element.bannerImage && (
              <div className="mt-4">
                <div className="font-medium mb-2">Preview:</div>
                <img
                  src={element.bannerImage}
                  alt="Banner Preview"
                  className="w-full object-contain border rounded"
                  style={{ maxHeight: "200px" }}
                />
                <button
                  onClick={() => handleElementChange(element.id, { bannerImage: null })}
                  className="mt-2 w-full bg-red-500 hover:bg-red-600 text-white py-1 rounded"
                >
                  Remove Banner
                </button>
              </div>
            )}

            {commonDescriptionField}
          </div>
        );

      case "divider":
        return (
          <div className="space-y-3">
            {commonDescriptionField}
          </div>
        );

      case "hyperlink":
        return (
          <div className="space-y-3">
            <input
              type="text"
              value={element.text}
              onChange={(e) => handleElementChange(element.id, { text: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="Link text"
            />
            <input
              type="url"
              value={element.url}
              onChange={(e) => handleElementChange(element.id, { url: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="https://example.com"
            />
            <div className="flex items-center">
              <input
                type="checkbox"
                id={`newtab-${element.id}`}
                checked={element.openInNewTab}
                onChange={(e) => handleElementChange(element.id, { openInNewTab: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor={`newtab-${element.id}`} className="text-sm">
                Open in new tab
              </label>
            </div>
            {commonDescriptionField}
          </div>
        );

      case "image-gallery":
        return (
          <div className="space-y-3">
            <input
              type="text"
              value={element.label}
              onChange={(e) => handleElementChange(element.id, { label: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="Gallery label"
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium">Layout</label>
              <select
                value={element.layout}
                onChange={(e) => handleElementChange(element.id, { layout: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="grid">Grid</option>
                <option value="carousel">Carousel</option>
              </select>

              {element.layout === "grid" && (
                <>
                  <label className="block text-sm font-medium mt-2">Columns</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={element.columns}
                    onChange={(e) => handleElementChange(element.id, { columns: parseInt(e.target.value) || 3 })}
                    className="w-full p-2 border rounded"
                  />
                </>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Images</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  if (files.length > 0) {
                    const newImages = [...element.images];
                    files.forEach(file => {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        newImages.push({
                          url: event.target.result,
                          name: file.name,
                          size: file.size,
                          type: file.type
                        });
                        handleElementChange(element.id, { images: newImages });
                      };
                      reader.readAsDataURL(file);
                    });
                  }
                }}
                multiple
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => handleUploadButtonClick(element.id, 'images')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full"
              >
                Add Images
              </button>

              <div className={`mt-4 ${element.layout === 'grid' ? `grid grid-cols-${element.columns} gap-2` : ''}`}>
                {element.images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={img.url}
                      alt={img.name}
                      className="w-full h-32 object-cover rounded"
                    />
                    <button
                      onClick={() => {
                        const newImages = [...element.images];
                        newImages.splice(idx, 1);
                        handleElementChange(element.id, { images: newImages });
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {commonDescriptionField}
          </div>
        );

      case "ocr-aadhar":
        return (
          <div className="space-y-3">
            <input
              type="text"
              value={element.label}
              onChange={(e) => handleElementChange(element.id, { label: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="Label"
            />

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <div className="font-medium mb-2">Front Image (OCR)</div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, element.id, 'frontImage')}
                  className="hidden"
                />
                {element.frontImage ? (
                  <div className="relative">
                    <img
                      src={element.frontImage}
                      alt="Aadhar Front"
                      className="w-full h-40 object-contain border rounded-lg"
                    />
                    <button
                      onClick={() => handleElementChange(element.id, { frontImage: null })}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleUploadButtonClick(element.id, 'frontImage')}
                    className="w-full bg-gray-100 hover:bg-gray-200 p-4 rounded-lg border-2 border-dashed"
                  >
                    Upload Front (OCR)
                  </button>
                )}
              </div>

              <div>
                <div className="font-medium mb-2">Back Image (OCR)</div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, element.id, 'backImage')}
                  className="hidden"
                />
                {element.backImage ? (
                  <div className="relative">
                    <img
                      src={element.backImage}
                      alt="Aadhar Back"
                      className="w-full h-40 object-contain border rounded-lg"
                    />
                    <button
                      onClick={() => handleElementChange(element.id, { backImage: null })}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleUploadButtonClick(element.id, 'backImage')}
                    className="w-full bg-gray-100 hover:bg-gray-200 p-4 rounded-lg border-2 border-dashed"
                  >
                    Upload Back (OCR)
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <input
                type="text"
                value={element.aadharNumber}
                onChange={(e) => handleElementChange(element.id, { aadharNumber: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Aadhar Number (auto-filled by OCR)"
              />
              <input
                type="text"
                value={element.name}
                onChange={(e) => handleElementChange(element.id, { name: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Name (auto-filled by OCR)"
              />
              <input
                type="date"
                value={element.dob}
                onChange={(e) => handleElementChange(element.id, { dob: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Date of Birth (auto-filled by OCR)"
              />
              <input
                type="text"
                value={element.address}
                onChange={(e) => handleElementChange(element.id, { address: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Address (auto-filled by OCR)"
              />
            </div>

            {commonDescriptionField}
            {requiredField}
          </div>
        );

      case "ocr-password":
        return (
          <div className="space-y-3">
            <input
              type="text"
              value={element.label}
              onChange={(e) => handleElementChange(element.id, { label: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="Label"
            />

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <div className="font-medium mb-2">Front Image (OCR)</div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, element.id, 'frontImage')}
                  className="hidden"
                />
                {element.frontImage ? (
                  <div className="relative">
                    <img
                      src={element.frontImage}
                      alt="Passport Front"
                      className="w-full h-40 object-contain border rounded-lg"
                    />
                    <button
                      onClick={() => handleElementChange(element.id, { frontImage: null })}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleUploadButtonClick(element.id, 'frontImage')}
                    className="w-full bg-gray-100 hover:bg-gray-200 p-4 rounded-lg border-2 border-dashed"
                  >
                    Upload Front (OCR)
                  </button>
                )}
              </div>

              <div>
                <div className="font-medium mb-2">Back Image (OCR)</div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, element.id, 'backImage')}
                  className="hidden"
                />
                {element.backImage ? (
                  <div className="relative">
                    <img
                      src={element.backImage}
                      alt="Passport Back"
                      className="w-full h-40 object-contain border rounded-lg"
                    />
                    <button
                      onClick={() => handleElementChange(element.id, { backImage: null })}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleUploadButtonClick(element.id, 'backImage')}
                    className="w-full bg-gray-100 hover:bg-gray-200 p-4 rounded-lg border-2 border-dashed"
                  >
                    Upload Back (OCR)
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <input
                type="text"
                value={element.passportNumber}
                onChange={(e) => handleElementChange(element.id, { passportNumber: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Passport Number (auto-filled by OCR)"
              />
              <input
                type="text"
                value={element.fullName}
                onChange={(e) => handleElementChange(element.id, { fullName: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Full Name (auto-filled by OCR)"
              />
              <input
                type="text"
                value={element.nationality}
                onChange={(e) => handleElementChange(element.id, { nationality: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Nationality (auto-filled by OCR)"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={element.dob}
                  onChange={(e) => handleElementChange(element.id, { dob: e.target.value })}
                  className="p-2 border rounded"
                  placeholder="Date of Birth (auto-filled by OCR)"
                />
                <input
                  type="text"
                  value={element.placeOfBirth}
                  onChange={(e) => handleElementChange(element.id, { placeOfBirth: e.target.value })}
                  className="p-2 border rounded"
                  placeholder="Place of Birth (auto-filled by OCR)"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={element.issueDate}
                  onChange={(e) => handleElementChange(element.id, { issueDate: e.target.value })}
                  className="p-2 border rounded"
                  placeholder="Issue Date (auto-filled by OCR)"
                />
                <input
                  type="date"
                  value={element.expiryDate}
                  onChange={(e) => handleElementChange(element.id, { expiryDate: e.target.value })}
                  className="p-2 border rounded"
                  placeholder="Expiry Date (auto-filled by OCR)"
                />
              </div>
            </div>

            {commonDescriptionField}
            {requiredField}
          </div>
        );


      default:
        return (
          <div className="space-y-3">
            <div>Edit {element.type}</div>
            {commonDescriptionField}
          </div>
        );
    }
  };

  const renderElementPreview = (element) => {
    const renderDescription = () => {
      if (!element.description) return null;
      return (
        <div className="text-xs text-gray-500 mt-1">
          {element.description}
        </div>
      );
    };

    const renderError = () => {
      if (!formErrors[element.id]) return null;
      return (
        <div className="text-xs text-red-500 mt-1">
          {formErrors[element.id]}
        </div>
      );
    };

    const elementStyle = elementStyles[element.id] || {};

    const style = {
      fontFamily: elementStyle.fontFamily,
      fontSize: elementStyle.fontSize,
      color: elementStyle.color,
      backgroundColor: elementStyle.backgroundColor,
      borderWidth: elementStyle.borderWidth,
      borderStyle: elementStyle.borderStyle,
      borderColor: elementStyle.borderColor,
      padding: elementStyle.padding,
      borderRadius: elementStyle.borderRadius,
      ...(element.type === 'heading' ? { margin: '10px 0' } : {}),
    };

    switch (element.type) {
      case "heading":
        const HeadingTag = element.level || "h2";
        return (
          <div style={style}>
            <HeadingTag className="font-bold">{element.text}</HeadingTag>
            {renderDescription()}
          </div>
        );

      case "email":
      case "phone":
      case "full-name":
        return (
          <div style={style}>
            <label className="block mb-1 font-medium">
              {element.label}
              {element.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder={element.placeholder}
              value={element.value || ""}
              onChange={(e) => handleElementChange(element.id, { value: e.target.value })}
            />
            {renderDescription()}
            {renderError()}
          </div>
        );

      case "address":
        return (
          <div style={style}>
            <label className="block mb-1 font-medium">
              {element.label}
              {element.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={element.street1 || ""}
                onChange={(e) => handleElementChange(element.id, { street1: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Street Address"
              />
              <input
                type="text"
                value={element.street2 || ""}
                onChange={(e) => handleElementChange(element.id, { street2: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Street Address Line 2"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={element.city || ""}
                  onChange={(e) => handleElementChange(element.id, { city: e.target.value })}
                  className="p-2 border rounded"
                  placeholder="City"
                />
                <input
                  type="text"
                  value={element.state || ""}
                  onChange={(e) => handleElementChange(element.id, { state: e.target.value })}
                  className="p-2 border rounded"
                  placeholder="State/Province"
                />
              </div>
              <input
                type="text"
                value={element.postalCode || ""}
                onChange={(e) => handleElementChange(element.id, { postalCode: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Postal/Zip Code"
              />
            </div>
            {renderDescription()}
            {renderError()}
          </div>
        );
      case "download-document":
        return (
          <div style={style}>
            {element.label && (
              <label className="block mb-1 font-medium">
                {element.label}
              </label>
            )}
            {element.document ? (
              <a
                href={element.document.url}
                download={element.document.name}
                className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
              >
                {element.buttonText || "Download"}
              </a>
            ) : (
              <div className="text-gray-500 italic">No document uploaded</div>
            )}
            {renderDescription()}
          </div>
        );

      case "aadhar":
        return (
          <div style={style}>
            <label className="block mb-1 font-medium">
              {element.label}
              {element.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={element.aadharNumber || ""}
                onChange={(e) => handleElementChange(element.id, { aadharNumber: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Aadhar Number (12 digits)"
                maxLength="12"
              />
              <input
                type="text"
                value={element.name || ""}
                onChange={(e) => handleElementChange(element.id, { name: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Full Name as on Aadhar"
              />
              <input
                type="date"
                value={element.dob || ""}
                onChange={(e) => handleElementChange(element.id, { dob: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Date of Birth"
              />
              <select
                value={element.gender || ""}
                onChange={(e) => handleElementChange(element.id, { gender: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <textarea
                value={element.address || ""}
                onChange={(e) => handleElementChange(element.id, { address: e.target.value })}
                className="w-full p-2 border rounded"
                rows={3}
                placeholder="Address as on Aadhar"
              />

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <div className="font-medium mb-2">Front Image</div>
                  {element.frontImage ? (
                    <img
                      src={element.frontImage}
                      alt="Aadhar Front"
                      className="w-full h-40 object-contain border rounded-lg"
                    />
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500">
                      No image uploaded
                    </div>
                  )}
                </div>

                <div>
                  <div className="font-medium mb-2">Back Image</div>
                  {element.backImage ? (
                    <img
                      src={element.backImage}
                      alt="Aadhar Back"
                      className="w-full h-40 object-contain border rounded-lg"
                    />
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500">
                      No image uploaded
                    </div>
                  )}
                </div>
              </div>
            </div>
            {renderDescription()}
            {renderError()}
          </div>
        );

      case "passport":
        return (
          <div style={style}>
            <label className="block mb-1 font-medium">
              {element.label}
              {element.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={element.passportNumber || ""}
                onChange={(e) => handleElementChange(element.id, { passportNumber: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Passport Number"
              />
              <input
                type="text"
                value={element.fullName || ""}
                onChange={(e) => handleElementChange(element.id, { fullName: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Full Name as on Passport"
              />
              <input
                type="text"
                value={element.nationality || ""}
                onChange={(e) => handleElementChange(element.id, { nationality: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Nationality"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={element.dob || ""}
                  onChange={(e) => handleElementChange(element.id, { dob: e.target.value })}
                  className="p-2 border rounded"
                  placeholder="Date of Birth"
                />
                <input
                  type="text"
                  value={element.placeOfBirth || ""}
                  onChange={(e) => handleElementChange(element.id, { placeOfBirth: e.target.value })}
                  className="p-2 border rounded"
                  placeholder="Place of Birth"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={element.issueDate || ""}
                  onChange={(e) => handleElementChange(element.id, { issueDate: e.target.value })}
                  className="p-2 border rounded"
                  placeholder="Issue Date"
                />
                <input
                  type="date"
                  value={element.expiryDate || ""}
                  onChange={(e) => handleElementChange(element.id, { expiryDate: e.target.value })}
                  className="p-2 border rounded"
                  placeholder="Expiry Date"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <div className="font-medium mb-2">Front Image</div>
                  {element.frontImage ? (
                    <img
                      src={element.frontImage}
                      alt="Passport Front"
                      className="w-full h-40 object-contain border rounded-lg"
                    />
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500">
                      No image uploaded
                    </div>
                  )}
                </div>

                <div>
                  <div className="font-medium mb-2">Back Image</div>
                  {element.backImage ? (
                    <img
                      src={element.backImage}
                      alt="Passport Back"
                      className="w-full h-40 object-contain border rounded-lg"
                    />
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500">
                      No image uploaded
                    </div>
                  )}
                </div>
              </div>
            </div>
            {renderDescription()}
            {renderError()}
          </div>
        );

      case "dropdown":
        return (
          <div style={style}>
            <label className="block mb-1 font-medium">
              {element.label}
              {element.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              className="w-full p-2 border rounded"
              value={element.selectedOption || ""}
              onChange={(e) => handleElementChange(element.id, { selectedOption: e.target.value })}
            >
              <option value="">Select an option</option>
              {element.options.map((option, idx) => (
                <option key={idx} value={option}>{option}</option>
              ))}
            </select>
            {renderDescription()}
            {renderError()}
          </div>
        );

      case "single-choice":
        return (
          <div style={style}>
            <label className="block mb-1 font-medium">
              {element.label}
              {element.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {element.options.map((option, idx) => (
                <div key={idx} className="flex items-center">
                  <input
                    type="radio"
                    name={`radio-${element.id}`}
                    className="mr-2"
                    checked={element.selectedOption === option}
                    onChange={() => handleElementChange(element.id, { selectedOption: option })}
                  />
                  <span>{option}</span>
                </div>
              ))}
            </div>
            {renderDescription()}
            {renderError()}
          </div>
        );

      case "multiple-choice":
        return (
          <div style={style}>
            <label className="block mb-1 font-medium">
              {element.label}
              {element.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {element.options.map((option, idx) => (
                <div key={idx} className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={element.selectedOptions?.includes(option) || false}
                    onChange={(e) => {
                      const selected = element.selectedOptions || [];
                      const newSelected = e.target.checked
                        ? [...selected, option]
                        : selected.filter(opt => opt !== option);
                      handleElementChange(element.id, { selectedOptions: newSelected });
                    }}
                  />
                  <span>{option}</span>
                </div>
              ))}
            </div>
            {renderDescription()}
            {renderError()}
          </div>
        );

      case "paragraph":
        return (
          <div style={style}>
            <p className="text-gray-700">{element.content}</p>
            {renderDescription()}
          </div>
        );

      case "date":
        return (
          <div style={style}>
            <label className="block mb-1 font-medium">
              {element.label}
              {element.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="date"
              value={element.selectedDate || ""}
              onChange={(e) =>
                handleElementChange(element.id, { selectedDate: e.target.value })
              }
              className="w-full p-2 border rounded"
            />
            {renderDescription()}
            {renderError()}
          </div>
        );

      case "time":
        return (
          <div style={style}>
            <label className="block mb-1 font-medium">
              {element.label}
              {element.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="time"
              value={element.selectedTime || ""}
              onChange={(e) =>
                handleElementChange(element.id, { selectedTime: e.target.value })
              }
              className="w-full p-2 border rounded"
            />
            {renderDescription()}
            {renderError()}
          </div>
        );

      case "signature":
  return (
    <div style={style}>
      <label className="block mb-1 font-medium">
        {element.label}
        {element.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <SignaturePad element={element} />
      {renderDescription()}
      {renderError()}
    </div>
  );

      case "file-upload":
        return (
          <div style={style}>
            <label className="block mb-1 font-medium">
              {element.label}
              {element.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileUpload(e, element.id, 'file')}
              className="hidden"
            />
            {element.file ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="truncate">{element.file.name}</span>
                  <span className="text-green-500 ml-2">✓</span>
                </div>
                <button
                  onClick={() => handleElementChange(element.id, { file: null })}
                  className="mt-2 w-full bg-red-500 hover:bg-red-600 text-white py-1 rounded"
                >
                  Remove File
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <div className="text-gray-500 mb-2">No file chosen</div>
                <button
                  className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded text-sm"
                  onClick={() => handleUploadButtonClick(element.id, 'file')}
                >
                  Choose File
                </button>
              </div>
            )}
            {renderDescription()}
            {renderError()}
          </div>
        );
      case "star-rating":
        return (
          <div style={style}>
            <label className="block mb-1 font-medium">
              {element.label}
              {element.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="flex items-center">
              {[...Array(element.maxRating || 5)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleElementChange(element.id, { rating: i + 1 })}
                  className="text-2xl mr-1 cursor-pointer"
                >
                  {i < element.rating ? "★" : "☆"}
                </button>
              ))}
            </div>
            {renderDescription()}
            {renderError()}
          </div>
        );

      case "scale-rating":
        return (
          <div style={style}>
            <label className="block mb-1 font-medium">
              {element.label}
              {element.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="flex items-center justify-between">
              <span>{element.min || 1}</span>
              <input
                type="range"
                min={element.min || 1}
                max={element.max || 10}
                value={element.value || 5}
                onChange={(e) =>
                  handleElementChange(element.id, { value: parseInt(e.target.value) })
                }
                className="w-full mx-2"
              />
              <span>{element.max || 10}</span>
            </div>
            <div className="text-center mt-1">{element.value || 5}</div>
            {renderDescription()}
            {renderError()}
          </div>
        );

      case "banner":
        return (
          <div style={style}>
            <label className="block mb-1 font-medium">{element.label}</label>
            {element.bannerImage ? (
              <div className="relative">
                <img
                  src={element.bannerImage}
                  alt="Banner"
                  className="w-full object-cover rounded-lg"
                  style={{ height: `${element.height}px` }}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleElementChange(element.id, { bannerImage: null });
                  }}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer"
                style={{ height: `${element.height}px` }}
                onClick={() => handleUploadButtonClick(element.id, 'bannerImage')}
              >
                <span className="text-gray-500">Upload banner</span>
              </div>
            )}
            {renderDescription()}
          </div>
        );

      case "hyperlink":
        return (
          <div style={style}>
            <a
              href={element.url}
              target={element.openInNewTab ? "_blank" : "_self"}
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              {element.text}
            </a>
            {renderDescription()}
          </div>
        );

      case "image-gallery":
        return (
          <div style={style}>
            {element.label && (
              <label className="block mb-1 font-medium">
                {element.label}
              </label>
            )}

            {element.layout === "grid" ? (
              <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${element.columns}, 1fr)` }}>
                {element.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img.url}
                    alt={img.name}
                    className="w-full h-auto object-contain rounded"
                  />
                ))}
              </div>
            ) : (
              <div className="relative overflow-hidden">
                <div className="flex overflow-x-auto space-x-4 py-2 scrollbar-hide">
                  {element.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img.url}
                      alt={img.name}
                      className="h-48 w-auto object-contain rounded"
                    />
                  ))}
                </div>
              </div>
            )}
            {renderDescription()}
          </div>
        );

      case "divider":
        return (
          <div className="relative my-6" style={style}>
            <hr className="border-t-2 border-gray-300" />
            {element.description && (
              <div className="text-xs text-gray-500 mt-1 text-center">
                {element.description}
              </div>
            )}
          </div>
        );

      case "nearest-airport":
        return (
          <div style={style}>
            <label className="block mb-1 font-medium">
              {element.label}
              {element.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Address</label>
              <input
                type="text"
                value={element.address || ""}
                onChange={(e) => handleElementChange(element.id, { address: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Enter airport address"
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Airport</label>
              <select
                value={element.selectedAirport || ""}
                onChange={(e) => handleElementChange(element.id, { selectedAirport: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Airport</option>
                {element.airportOptions.map((airport, idx) => (
                  <option key={idx} value={airport}>{airport}</option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Distance (KM)</label>
              <input
                type="number"
                value={element.distanceKm || ""}
                onChange={(e) => handleElementChange(element.id, { distanceKm: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Enter distance"
                min="0"
              />
            </div>

            {renderDescription()}
            {renderError()}
          </div>
        );
      case "ocr-aadhar":
        return (
          <div style={style}>
            <label className="block mb-1 font-medium">
              {element.label}
              {element.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <div className="font-medium mb-2">Front Image (OCR)</div>
                {element.frontImage ? (
                  <img
                    src={element.frontImage}
                    alt="Aadhar Front"
                    className="w-full h-40 object-contain border rounded-lg"
                  />
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500">
                    No image uploaded
                  </div>
                )}
              </div>

              <div>
                <div className="font-medium mb-2">Back Image (OCR)</div>
                {element.backImage ? (
                  <img
                    src={element.backImage}
                    alt="Aadhar Back"
                    className="w-full h-40 object-contain border rounded-lg"
                  />
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500">
                    No image uploaded
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <input
                type="text"
                value={element.aadharNumber || ""}
                onChange={(e) => handleElementChange(element.id, { aadharNumber: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Aadhar Number (auto-filled by OCR)"
                readOnly={!!element.aadharNumber}
              />
              <input
                type="text"
                value={element.name || ""}
                onChange={(e) => handleElementChange(element.id, { name: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Name (auto-filled by OCR)"
                readOnly={!!element.name}
              />
              <input
                type="date"
                value={element.dob || ""}
                onChange={(e) => handleElementChange(element.id, { dob: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Date of Birth (auto-filled by OCR)"
                readOnly={!!element.dob}
              />
              <input
                type="text"
                value={element.address || ""}
                onChange={(e) => handleElementChange(element.id, { address: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Address (auto-filled by OCR)"
                readOnly={!!element.address}
              />
            </div>

            {renderDescription()}
            {renderError()}
          </div>
        );

      case "ocr-password":
        return (
          <div style={style}>
            <label className="block mb-1 font-medium">
              {element.label}
              {element.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <div className="font-medium mb-2">Front Image (OCR)</div>
                {element.frontImage ? (
                  <img
                    src={element.frontImage}
                    alt="Passport Front"
                    className="w-full h-40 object-contain border rounded-lg"
                  />
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500">
                    No image uploaded
                  </div>
                )}
              </div>

              <div>
                <div className="font-medium mb-2">Back Image (OCR)</div>
                {element.backImage ? (
                  <img
                    src={element.backImage}
                    alt="Passport Back"
                    className="w-full h-40 object-contain border rounded-lg"
                  />
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500">
                    No image uploaded
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <input
                type="text"
                value={element.passportNumber || ""}
                onChange={(e) => handleElementChange(element.id, { passportNumber: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Passport Number (auto-filled by OCR)"
                readOnly={!!element.passportNumber}
              />
              <input
                type="text"
                value={element.fullName || ""}
                onChange={(e) => handleElementChange(element.id, { fullName: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Full Name (auto-filled by OCR)"
                readOnly={!!element.fullName}
              />
              <input
                type="text"
                value={element.nationality || ""}
                onChange={(e) => handleElementChange(element.id, { nationality: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Nationality (auto-filled by OCR)"
                readOnly={!!element.nationality}
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={element.dob || ""}
                  onChange={(e) => handleElementChange(element.id, { dob: e.target.value })}
                  className="p-2 border rounded"
                  placeholder="Date of Birth (auto-filled by OCR)"
                  readOnly={!!element.dob}
                />
                <input
                  type="text"
                  value={element.placeOfBirth || ""}
                  onChange={(e) => handleElementChange(element.id, { placeOfBirth: e.target.value })}
                  className="p-2 border rounded"
                  placeholder="Place of Birth (auto-filled by OCR)"
                  readOnly={!!element.placeOfBirth}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={element.issueDate || ""}
                  onChange={(e) => handleElementChange(element.id, { issueDate: e.target.value })}
                  className="p-2 border rounded"
                  placeholder="Issue Date (auto-filled by OCR)"
                  readOnly={!!element.issueDate}
                />
                <input
                  type="date"
                  value={element.expiryDate || ""}
                  onChange={(e) => handleElementChange(element.id, { expiryDate: e.target.value })}
                  className="p-2 border rounded"
                  placeholder="Expiry Date (auto-filled by OCR)"
                  readOnly={!!element.expiryDate}
                />
              </div>
            </div>

            {renderDescription()}
            {renderError()}
          </div>
        );
      default:
        return (
          <div style={style}>
            <div>{element.label}</div>
            {renderDescription()}
          </div>
        );
    }
  };

  const ElementToolbar = ({ element }) => {
    if (previewMode) return null;

    const elements = currentElements;
    const index = elements.findIndex(el => el.id === element.id);
    const isFirst = index === 0;
    const isLast = index === elements.length - 1;

    return (
      <div className="absolute -top-3 right-0 flex bg-white rounded shadow border">
        <button
          className={`p-1 ${isFirst ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:bg-gray-100"}`}
          onClick={(e) => {
            e.stopPropagation();
            handleMoveElement(element.id, "up");
          }}
          disabled={isFirst}
          title="Move up"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button
          className={`p-1 ${isLast ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:bg-gray-100"}`}
          onClick={(e) => {
            e.stopPropagation();
            handleMoveElement(element.id, "down");
          }}
          disabled={isLast}
          title="Move down"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <button
          className="p-1 text-red-500 hover:bg-red-50"
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteElement(element.id);
          }}
          title="Delete"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
  };

  const renderElement = (element) => {
    if (previewMode && visibilityMap[element.id] !== true) {
      return null;
    }

    const isActive = activeElement === element.id && !previewMode;
    const elementStyle = elementStyles[element.id] || {};

    const style = {
      fontFamily: elementStyle.fontFamily,
      fontSize: elementStyle.fontSize,
      color: elementStyle.color,
      backgroundColor: elementStyle.backgroundColor,
      borderWidth: elementStyle.borderWidth,
      borderStyle: elementStyle.borderStyle,
      borderColor: elementStyle.borderColor,
      padding: elementStyle.padding,
      borderRadius: elementStyle.borderRadius,
      ...(element.type === 'heading' ? { margin: '10px 0' } : {}),
    };

    return (
      <div
        key={element.id}
        className={`relative mb-4 bg-white p-3 ${isActive ? "shadow-md" : ""}`}
        style={style}
        onClick={() => !previewMode && setActiveElement(element.id)}
      >
        {isActive && <ElementToolbar element={element} />}

        <div className={`rounded-lg ${isActive ? "border-2 border-blue-500" : "border-gray-300"}`}>
          {previewMode ? renderElementPreview(element) : (
            isActive ? renderElementEditor(element) : renderElementPreview(element)
          )}
        </div>
      </div>
    );
  };

  const validateForm = () => {
    const errors = {};

    steps.forEach(step => {
      step.elements.forEach(element => {
        if (!element.required) return;

        switch (element.type) {
          case "full-name":
          case "email":
          case "phone":
          case "date":
          case "time":
            if (!element.value) {
              errors[element.id] = "This field is required";
            }
            break;

          case "address":
            if (!element.street1 || !element.city || !element.state || !element.postalCode) {
              errors[element.id] = "All address fields are required";
            }
            break;

          case "aadhar":
            if (!element.aadharNumber || element.aadharNumber.length !== 12 ||
              !element.name || !element.dob || !element.gender || !element.address ||
              !element.frontImage || !element.backImage) {
              errors[element.id] = "All Aadhar fields are required";
            }
            break;

          case "passport":
            if (!element.passportNumber || !element.fullName || !element.nationality ||
              !element.dob || !element.placeOfBirth || !element.issueDate ||
              !element.expiryDate || !element.frontImage || !element.backImage) {
              errors[element.id] = "All Passport fields are required";
            }
            break;

          case "dropdown":
            if (!element.selectedOption) {
              errors[element.id] = "Please select an option";
            }
            break;

          case "single-choice":
            if (!element.selectedOption) {
              errors[element.id] = "Please select an option";
            }
            break;

          case "multiple-choice":
            if (!element.selectedOptions || element.selectedOptions.length === 0) {
              errors[element.id] = "Please select at least one option";
            }
            break;

          case "file-upload":
            if (!element.file) {
              errors[element.id] = "Please upload a file";
            }
            break;

          case "signature":
            if (!element.signatureData) {
              errors[element.id] = "Signature is required";
            }
            break;

          default:
            break;
        }
      });
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Fixed handleSaveForm function
  const handleSaveForm = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      if (!formId) {
        throw new Error("Form ID is missing");
      }

      // Prepare the form data structure for update - FIXED VERSION
      const formData = {
        name: formName,
        steps: steps.map(step => ({
          name: step.name,
          elements: step.elements.map(element => {
            // Create the config object with element properties
            const config = {
              id: element.id,
              type: element.type,
              label: element.label || '',
              placeholder: element.placeholder || '',
              description: element.description || '',
              required: element.required || false,
              value: element.value || '' // Ensure value is included
            };

            // Add type-specific properties to config
            switch (element.type) {
              case 'heading':
                config.text = element.text || '';
                config.level = element.level || 'h2';
                break;
              case 'address':
                config.street1 = element.street1 || '';
                config.street2 = element.street2 || '';
                config.city = element.city || '';
                config.state = element.state || '';
                config.postalCode = element.postalCode || '';
                break;
              case 'dropdown':
              case 'single-choice':
              case 'multiple-choice':
                config.options = element.options || [];
                config.selectedOption = element.selectedOption || '';
                config.selectedOptions = element.selectedOptions || [];
                break;
              case 'paragraph':
                config.content = element.content || '';
                break;
              case 'date':
                config.selectedDate = element.selectedDate || '';
                break;
              case 'time':
                config.selectedTime = element.selectedTime || '';
                break;
              case 'signature':
                config.signatureData = element.signatureData || null;
                break;
              case 'file-upload':
                config.file = element.file || null;
                break;
              case 'star-rating':
                config.rating = element.rating || 0;
                config.maxRating = element.maxRating || 5;
                break;
              case 'scale-rating':
                config.value = element.value || 5;
                config.min = element.min || 1;
                config.max = element.max || 10;
                break;
              case 'banner':
                config.bannerImage = element.bannerImage || null;
                config.height = element.height || 200;
                break;
              case 'hyperlink':
                config.text = element.text || '';
                config.url = element.url || '';
                config.openInNewTab = element.openInNewTab || false;
                break;
              case 'image-gallery':
                config.images = element.images || [];
                config.layout = element.layout || 'grid';
                config.columns = element.columns || 3;
                break;
              case 'aadhar':
              case 'ocr-aadhar':
                config.aadharNumber = element.aadharNumber || '';
                config.name = element.name || '';
                config.dob = element.dob || '';
                config.gender = element.gender || '';
                config.address = element.address || '';
                config.frontImage = element.frontImage || null;
                config.backImage = element.backImage || null;
                break;
              case 'passport':
              case 'ocr-password':
                config.passportNumber = element.passportNumber || '';
                config.fullName = element.fullName || '';
                config.nationality = element.nationality || '';
                config.dob = element.dob || '';
                config.placeOfBirth = element.placeOfBirth || '';
                config.issueDate = element.issueDate || '';
                config.expiryDate = element.expiryDate || '';
                config.frontImage = element.frontImage || null;
                config.backImage = element.backImage || null;
                break;
              case 'download-document':
                config.document = element.document || null;
                config.buttonText = element.buttonText || 'Download';
                break;
              case 'nearest-airport':
                config.address = element.address || '';
                config.selectedAirport = element.selectedAirport || '';
                config.airportOptions = element.airportOptions || [
                  "Indira Gandhi International Airport (DEL)",
                  "Chhatrapati Shivaji Maharaj International Airport (BOM)",
                  "Kempegowda International Airport (BLR)"
                ];
                config.distanceKm = element.distanceKm || '';
                break;
              default:
                // For any other field types, include the value
                config.value = element.value || '';
            }

            return {
              id: element.id,
              type: element.type,
              config: config
            };
          })
        })),
        elementStyles: JSON.parse(JSON.stringify(elementStyles)),
        rules: formRules.map(rule => ({
          id: rule.id,
          conditions: rule.conditions.map(cond => ({
            field: cond.field,
            operator: cond.state,
            value: cond.value || "", // Ensure value is never undefined
            fieldType: cond.fieldType,
            logic: cond.logic
          })),
          actions: rule.actions.map(action => ({
            action: action.action.toLowerCase(),
            target: action.target
          }))
        }))
      };

      // Clean up any undefined or null values in the form data
      const cleanFormData = JSON.parse(JSON.stringify(formData, (key, value) =>
        value === null || value === undefined ? '' : value
      ));

      console.log('Saving form data:', cleanFormData); // For debugging

      const response = await fetch(`https://tableware-dweeb-estate.ngrok-free.dev/api/forms/${formId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(cleanFormData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update form');
      }

      const data = await response.json();

      setSaveSuccess(true);
      setFormUrl(data.formUrl || `https://tableware-dweeb-estate.ngrok-free.dev/operations/SharedFormView/${shareId}`);
    } catch (error) {
      setSaveError(error.message);
      console.error('Error updating form:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitForm = () => {
    if (validateForm()) {
      alert("Form submitted successfully!");
      console.log("Form data:", steps);
    } else {
      alert("Please fill all required fields");
    }
  };

  const addNewStep = () => {
    const newStepId = `step${steps.length + 1}`;
    const newStep = { id: newStepId, name: `Step ${steps.length + 1}`, elements: [] };

    setSteps([...steps, newStep]);
    setCurrentStepIndex(steps.length);

    // Initialize visibility for any elements that might be added to this new step
    if (previewMode) {
      const newVisibilityMap = { ...visibilityMap };
      newStep.elements.forEach(el => {
        newVisibilityMap[el.id] = false;
      });
      setVisibilityMap(newVisibilityMap);
    }
  };

  const removeStep = (index) => {
    if (steps.length <= 1) return;

    const newSteps = steps.filter((_, i) => i !== index);
    setSteps(newSteps);

    if (currentStepIndex === index) {
      setCurrentStepIndex(Math.max(0, index - 1));
    } else if (currentStepIndex > index) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const moveStep = (index, direction) => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === steps.length - 1)
    ) return;

    const newSteps = [...steps];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
    setSteps(newSteps);

    if (currentStepIndex === index) {
      setCurrentStepIndex(newIndex);
    } else if (currentStepIndex === newIndex) {
      setCurrentStepIndex(index);
    }
  };

  const renameStep = (index, newName) => {
    const newSteps = [...steps];
    newSteps[index].name = newName;
    setSteps(newSteps);
  };

  const goToNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const goToPrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const StepNavigation = () => (
    <div className="flex justify-between mt-6">
      {currentStepIndex > 0 && (
        <button
          className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded"
          onClick={goToPrevStep}
        >
          Previous
        </button>
      )}

      {currentStepIndex < steps.length - 1 ? (
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
          onClick={goToNextStep}
        >
          Next
        </button>
      ) : (
        <button
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
          onClick={handleSubmitForm}
        >
          Submit Form
        </button>
      )}
    </div>
  );

  const sidebarElements = {
    BASIC: [
      { label: "Heading", type: "heading" },
      { label: "Full Name", type: "full-name" },
      { label: "Email", type: "email" },
      { label: "Address", type: "address" },
      { label: "Phone", type: "phone" },
      { label: "Date Picker", type: "date" },
      { label: "Time", type: "time" },
      { label: "Signature", type: "signature" },
      { label: "Hyperlink", type: "hyperlink" },
      { label: "Download Document", type: "download-document" },
      { label: "Nearest Airport", type: "nearest-airport" },
    ],
    "IDENTITY DOCUMENTS": [
      { label: "Aadhar Card", type: "aadhar" },
      { label: "Passport", type: "passport" },
      { label: "OCR Aadhar", type: "ocr-aadhar" },
      { label: "OCR Password", type: "ocr-password" },
    ],
    "BASIC ELEMENTS": [
      { label: "Paragraph", type: "paragraph" },
      { label: "Dropdown", type: "dropdown" },
      { label: "Single Choice", type: "single-choice" },
      { label: "Multiple Choice", type: "multiple-choice" },
      { label: "File Upload", type: "file-upload" },
      { label: "Image Gallery", type: "image-gallery" },
    ],
    "RATING ELEMENTS": [
      { label: "Star Rating", type: "star-rating" },
      { label: "Scale Rating", type: "scale-rating" },
    ],
    "PAGE ELEMENTS": [
      { label: "Banner", type: "banner" },
      { label: "Divider", type: "divider" },
    ],
  };

  const getRuleDescription = (rule) => {
    const conditionDescriptions = rule.conditions.map((cond, idx) => {
      const field = fieldOptions.find(f => f.id === cond.field);
      const fieldLabel = field ? field.label : 'Unknown field';

      let description = `${fieldLabel} ${cond.state}`;
      if (cond.value) description += ` "${cond.value}"`;
      if (idx > 0) description = `${rule.conditions[idx].logic} ${description}`;

      return description;
    });

    const actionDescriptions = rule.actions.map(action => {
      const field = fieldOptions.find(f => f.id === action.target);
      return `${action.action} ${field?.label || 'Unknown field'}`;
    });

    return {
      conditions: conditionDescriptions.join(' '),
      actions: actionDescriptions.join(', ')
    };
  };

  const deleteRule = (ruleId) => {
    setFormRules(formRules.filter(rule => rule.id !== ruleId));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Loading form...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center justify-between bg-orange-500 text-white px-6 py-3">
        <div className="flex items-center space-x-6">
          <div className="font-bold text-lg">Edit Form</div>
           <button onClick={() => navigate(-1)} className="btn btn-secondary">
      ← Back
    </button>
        </div>
        <div className="flex items-center space-x-4">
          <button
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1 rounded"
            onClick={() => setConditionshow(true)}
          >
            Conditions
          </button>
          <button
            className={`${isSaving ? 'bg-blue-400' :
                saveSuccess ? 'bg-green-500 hover:bg-green-600' :
                  'bg-blue-500 hover:bg-blue-600'
              } text-white px-4 py-1 rounded`}
            onClick={handleSaveForm}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Update Form"}
          </button>
          <label className="flex items-center cursor-pointer">
            <span className="mr-2">Preview</span>
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={previewMode}
                onChange={() => setPreviewMode(!previewMode)}
              />
              <div className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors ${previewMode ? "bg-blue-500" : "bg-gray-300"
                }`}>
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${previewMode ? "translate-x-5" : ""
                  }`}></div>
              </div>
            </div>
          </label>
        </div>
      </div>

      {saveError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mx-6 my-2">
          <span className="block sm:inline">Error: {saveError}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setSaveError(null)}
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex flex-1">
        {!previewMode && (
          <div className="w-[15rem] bg-gray-900 text-white flex flex-col h-[100vh]  scrollbar-none ">
            <div className="p-4 text-xl font-bold border-b border-gray-700">
              Form Elements
            </div>

            <div className="flex border-b border-gray-700">
              {["BASIC", "PAYMENTS", "WIDGETS"].map((tab) => (
                <div
                  key={tab}
                  className={`flex-1 text-center py-2 cursor-pointer hover:bg-gray-700 ${tab === "BASIC" ? "bg-gray-800" : ""
                    }`}
                >
                  {tab}
                </div>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {Object.entries(sidebarElements).map(([section, elements]) => (
                <div key={section}>
                  <div className="font-semibold text-gray-400 mb-2">
                    {section}
                  </div>
                  {elements.map((item) => (
                    <div
                      key={item.label}
                      className="p-2 rounded hover:bg-gray-700 cursor-pointer"
                      draggable
                      onDragStart={() => handleDragStart(item.type)}
                      onClick={() => handleClickAdd(item.type)}
                    >
                      {item.label}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 border-t border-gray-700">
              <div className="font-semibold mb-2">Form Steps</div>
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`p-2 rounded mb-1 cursor-pointer flex justify-between items-center ${index === currentStepIndex ? 'bg-blue-600' : 'hover:bg-gray-700'
                    }`}
                  onClick={() => setCurrentStepIndex(index)}
                >
                  <div className="flex items-center w-full">
                    <input
                      type="text"
                      value={step.name}
                      onChange={(e) => renameStep(index, e.target.value)}
                      className="bg-transparent border-none outline-none w-full"
                    />
                  </div>
                  <div className="flex space-x-1">
                    <button
                      className={`p-1 ${index === 0 ? "text-gray-500 cursor-not-allowed" : "text-gray-300 hover:bg-gray-600"}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        moveStep(index, "up");
                      }}
                      disabled={index === 0}
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      className={`p-1 ${index === steps.length - 1 ? "text-gray-500 cursor-not-allowed" : "text-gray-300 hover:bg-gray-6"}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        moveStep(index, "down");
                      }}
                      disabled={index === steps.length - 1}
                      title="Move down"
                    >
                      ↓
                    </button>
                    <button
                      className="p-1 text-red-500 hover:bg-red-900 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeStep(index);
                      }}
                      disabled={steps.length <= 1}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
              <button
                className="mt-2 w-full bg-green-600 hover:bg-green-700 py-1 rounded text-sm"
                onClick={addNewStep}
              >
                Add Step
              </button>
            </div>
          </div>
        )}

        <div
          className={`p-6 overflow-auto bg-gray-100 ${previewMode ? "flex-1" : "w-[81%] "
            }`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={previewMode ? undefined : handleDrop}
        >
          {editingFormName ? (
            <div className="max-w-2xl mx-auto mb-6">
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                onBlur={() => setEditingFormName(false)}
                className="text-2xl font-bold text-center w-full border-b border-gray-400 bg-transparent outline-none"
                autoFocus
              />
            </div>
          ) : (
            <div
              className="text-center text-2xl font-bold mb-6 cursor-pointer"
              onClick={() => !previewMode && setEditingFormName(true)}
            >
              {formName}
            </div>
          )}

          {previewMode && steps.length > 1 && (
            <div className="flex justify-center mb-6">
              <div className="flex space-x-2">
                {steps.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-3 h-3 rounded-full ${idx === currentStepIndex ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                  />
                ))}
              </div>
            </div>
          )}

          {currentElements.length > 0 ? (
            <div className="max-w-2xl mx-auto">
              {currentElements.map(renderElement)}
            </div>
          ) : (
            <div
              className="flex justify-center items-center min-h-[300px] border-2 border-dashed border-gray-400 rounded p-6 text-gray-500 bg-white"
              onDragOver={(e) => e.preventDefault()}
              onDrop={previewMode ? undefined : handleDrop}
            >
              {previewMode ? "This step is empty" : "Drag your first question here from the left."}
            </div>
          )}

          {previewMode && <StepNavigation />}
        </div>

        {!previewMode && activeElement && (
          <StylePanel element={currentElements.find(el => el.id === activeElement)} />
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileInputChange(e)}
        className="hidden"
      />

      <input
        type="file"
        ref={bannerFileInputRef}
        onChange={(e) => handleFileInputChange(e)}
        accept="image/*"
        className="hidden"
      />

      {formUrl && <Pop url={formUrl} setFormUrl={setFormUrl} />}

      {conditionsshow && (
        <RuleBuilder
          setConditionshow={setConditionshow}
          steps={steps}
          fieldOptions={fieldOptions}
          onSaveRules={(rule) => setFormRules([...formRules, rule])}
          formRules={formRules}
          setFormRules={setFormRules}
        />
      )}
    </div>
  );
};

export default EditFormPage;