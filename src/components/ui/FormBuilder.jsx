import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronDown, Plus, Settings, X, Save, Mail, Send, Loader, Eye, Edit3, Code, Upload, FileText } from "lucide-react";

// ==================== HTML Email Editor Component ====================
const HTMLEmailEditor = ({ value, onChange, previewMode = false }) => {
  const [mode, setMode] = useState('design');
  const [htmlContent, setHtmlContent] = useState(value || '');
  const [fileName, setFileName] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  
  useEffect(() => {
    if (value !== htmlContent) {
      setHtmlContent(value);
    }
  }, [value]);

  const handleHtmlChange = (e) => {
    const newHtml = e.target.value;
    setHtmlContent(newHtml);
    onChange(newHtml);
  };

  const handleDesignChange = (e) => {
    const content = e.target.innerHTML;
    setHtmlContent(content);
    onChange(content);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['text/html', 'text/plain', 'application/xhtml+xml'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (!validTypes.includes(file.type) && !['html', 'htm', 'txt'].includes(fileExtension)) {
      alert('Please upload a valid HTML file (.html, .htm, or .txt)');
      return;
    }

    setFileName(file.name);
    setUploadedFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      setHtmlContent(content);
      onChange(content);
      setMode('html');
    };
    reader.onerror = () => {
      alert('Error reading file. Please try again.');
    };
    reader.readAsText(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setFileName('');
    setHtmlContent('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const renderDesignEditor = () => (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-100 p-2 border-b flex items-center gap-2 flex-wrap">
        <button 
          className="p-1 hover:bg-gray-200 rounded"
          onClick={() => document.execCommand('bold')}
          title="Bold"
        >
          <b>B</b>
        </button>
        <button 
          className="p-1 hover:bg-gray-200 rounded"
          onClick={() => document.execCommand('italic')}
          title="Italic"
        >
          <i>I</i>
        </button>
        <button 
          className="p-1 hover:bg-gray-200 rounded"
          onClick={() => document.execCommand('underline')}
          title="Underline"
        >
          <u>U</u>
        </button>
        <span className="w-px h-6 bg-gray-300"></span>
        <button 
          className="p-1 hover:bg-gray-200 rounded"
          onClick={() => {
            const url = prompt('Enter URL:');
            if (url) document.execCommand('createLink', false, url);
          }}
          title="Insert Link"
        >
          🔗
        </button>
        <button 
          className="p-1 hover:bg-gray-200 rounded"
          onClick={() => {
            const color = prompt('Enter color (hex):');
            if (color) document.execCommand('foreColor', false, color);
          }}
          title="Text Color"
        >
          🎨
        </button>
        <span className="w-px h-6 bg-gray-300"></span>
        <button 
          className="p-1 hover:bg-gray-200 rounded"
          onClick={() => document.execCommand('insertUnorderedList')}
          title="Bullet List"
        >
          • List
        </button>
        <button 
          className="p-1 hover:bg-gray-200 rounded"
          onClick={() => document.execCommand('insertOrderedList')}
          title="Numbered List"
        >
          1. List
        </button>
        <span className="w-px h-6 bg-gray-300"></span>
        <select 
          className="p-1 border rounded text-sm"
          onChange={(e) => document.execCommand('formatBlock', false, e.target.value)}
          defaultValue="p"
        >
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
        </select>
        <button 
          className="p-1 hover:bg-gray-200 rounded"
          onClick={() => {
            const html = prompt('Paste HTML code:');
            if (html) document.execCommand('insertHTML', false, html);
          }}
          title="Insert HTML"
        >
          &lt;/&gt;
        </button>
       <button 
  className="p-1 hover:bg-gray-200 rounded ml-auto text-red-500"
  onClick={() => {
    if (window.confirm('Clear all content?')) {
      const editor = editorRef.current;
      if (editor) editor.innerHTML = '';
      setHtmlContent('');
      onChange('');
    }
  }}
  title="Clear Content"
>
  ✕
</button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        className="p-4 min-h-[200px] outline-none bg-white"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
        onInput={handleDesignChange}
        suppressContentEditableWarning
      />
    </div>
  );

  const renderHtmlEditor = () => (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-100 p-2 border-b flex items-center justify-between flex-wrap gap-2">
        <span className="text-sm font-medium text-gray-600">HTML Source</span>
        <div className="flex items-center gap-2">
          <button
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
            onClick={() => {
              try {
                const formatted = htmlContent
                  .replace(/>\s+</g, '>\n<')
                  .replace(/(<[^>]+>)/g, (match) => match.trim())
                  .replace(/^\s*[\r\n]/gm, '');
                setHtmlContent(formatted);
                onChange(formatted);
              } catch (e) {
                alert('Error formatting HTML');
              }
            }}
          >
            Format
          </button>
        </div>
      </div>
      <textarea
        value={htmlContent}
        onChange={handleHtmlChange}
        className="w-full p-4 font-mono text-sm min-h-[200px] outline-none border-0"
        spellCheck="false"
        placeholder="Enter HTML code here..."
      />
    </div>
  );

  const renderPreview = () => (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="bg-gray-100 p-2 border-b flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">Email Preview</span>
        <button
          className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
          onClick={() => {
            const previewWindow = window.open('', '_blank', 'width=800,height=600');
            if (previewWindow) {
              previewWindow.document.write(htmlContent);
              previewWindow.document.close();
            }
          }}
        >
          Open in New Window
        </button>
      </div>
      <div 
        className="p-4 min-h-[200px] prose max-w-none"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <input
          ref={fileInputRef}
          type="file"
          accept=".html,.htm,.txt"
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          onClick={handleUploadClick}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
        >
          <Upload size={18} />
          Upload HTML Emailer
        </button>
        {uploadedFile && (
          <div className="flex items-center gap-2 flex-1">
            <FileText size={16} className="text-green-600" />
            <span className="text-sm text-gray-700 truncate">{fileName}</span>
            <button
              onClick={handleRemoveFile}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X size={16} />
            </button>
          </div>
        )}
        {!uploadedFile && (
          <span className="text-sm text-gray-500">Upload an HTML file to edit or start from scratch</span>
        )}
      </div>

      <div className="flex items-center gap-2 border-b pb-2">
        <button
          className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${mode === 'design' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          onClick={() => setMode('design')}
          disabled={!htmlContent}
        >
          <Edit3 size={14} /> Design
        </button>
        <button
          className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${mode === 'html' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          onClick={() => setMode('html')}
        >
          <Code size={14} /> HTML
        </button>
        <button
          className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${mode === 'preview' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          onClick={() => setMode('preview')}
          disabled={!htmlContent}
        >
          <Eye size={14} /> Preview
        </button>
        <span className="text-xs text-gray-500 ml-auto">
          {htmlContent.length} characters
        </span>
      </div>

      <div className="mt-2">
        {!htmlContent ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <FileText size={48} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500">No HTML content loaded</p>
            <p className="text-sm text-gray-400 mt-1">Upload an HTML file or start creating</p>
            <button
              onClick={handleUploadClick}
              className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Upload HTML File
            </button>
          </div>
        ) : (
          <>
            {mode === 'design' && renderDesignEditor()}
            {mode === 'html' && renderHtmlEditor()}
            {mode === 'preview' && renderPreview()}
          </>
        )}
      </div>
    </div>
  );
};

// ==================== Email Modal Component ====================
const EmailModal = ({ isOpen, onClose, formData, onSaveAndSend }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [htmlMessage, setHtmlMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [emailType, setEmailType] = useState('share');
  const [isSaving, setIsSaving] = useState(false);
  const [useHtml, setUseHtml] = useState(false);
  const [uploadedHtmlFile, setUploadedHtmlFile] = useState(null);
  const [htmlFileName, setHtmlFileName] = useState('');
  const emailInputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && formData) {
      setSubject(getDefaultSubject());
      const defaultMsg = getDefaultMessage();
      setMessage(defaultMsg);
      setHtmlMessage(getHtmlTemplate());
      setTimeout(() => {
        if (emailInputRef.current) {
          emailInputRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen, formData, emailType]);

  const getDefaultSubject = () => {
    switch (emailType) {
      case 'share': return `Please fill out this form: ${formData?.name || 'Form'}`;
      case 'invite': return `Invitation to complete form: ${formData?.name || 'Form'}`;
      case 'reminder': return `Reminder: Please complete the form - ${formData?.name || 'Form'}`;
      default: return `Form Submission Request`;
    }
  };

  const getDefaultMessage = () => {
    const formUrl = formData?.formUrl || window.location.href;
    
    switch (emailType) {
      case 'share':
        return `Hello,\n\nYou have been invited to fill out the following form:\n\n📋 Form Name: ${formData?.name || 'Form'}\n\n🔗 Form Link: ${formUrl}\n\n${!formData?.isSaved ? '⚠️ Note: This form is currently being built and the link may change after final save.\n\n' : '✅ Form Status: Active\n\n'}Please click the link above to access and submit the form.\n\nThank you for your participation.\n\nBest regards,\nForm Administrator`;
      
      case 'invite':
        return `Dear User,\n\nYou are cordially invited to complete the "${formData?.name || 'Form'}" form.\n\nForm Details:\n━━━━━━━━━━━━━━━━━━━━━━━\n📝 Form Name: ${formData?.name || 'Form'}\n🔗 Access Link: ${formUrl}\n📅 Status: ${formData?.isSaved ? 'Open for submissions' : 'Under Construction'}\n━━━━━━━━━━━━━━━━━━━━━━━\n\n${!formData?.isSaved ? '\n⚠️ Note: The form is currently being built. The final link will be shared once the form is ready.\n\n' : ''}Please submit the form at your earliest convenience.\n\nBest regards,\nForm Administrator`;
      
      case 'reminder':
        return `Dear User,\n\nThis is a friendly reminder to complete the "${formData?.name || 'Form'}" form.\n\n🔗 Form Link: ${formUrl}\n\nIf you have already submitted the form, please ignore this message.\n\nThank you for your cooperation.\n\nBest regards,\nForm Administrator`;
      
      default:
        return `Hello,\n\nPlease access the form using the following link:\n${formUrl}\n\nBest regards,\nForm Administrator`;
    }
  };

  const getHtmlTemplate = () => {
    const formUrl = formData?.formUrl || window.location.href;
    const formName = formData?.name || 'Form';
    const isSaved = formData?.isSaved;

    if (uploadedHtmlFile) {
      return uploadedHtmlFile;
    }

    let content = '';
    switch (emailType) {
      case 'share':
        content = `
          <div style="font-family: Arial, Helvetica, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2c3e50;">Form Invitation</h2>
            <p>Hello,</p>
            <p>You have been invited to fill out the following form:</p>
            <table style="border-collapse: collapse; margin: 15px 0; width: 100%;">
              <tr style="border-bottom: 1px solid #ecf0f1;">
                <td style="padding: 8px 10px 8px 0; font-weight: bold; width: 140px;">📋 Form Name:</td>
                <td style="padding: 8px 0;">${formName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #ecf0f1;">
                <td style="padding: 8px 10px 8px 0; font-weight: bold;">🔗 Form Link:</td>
                <td style="padding: 8px 0;"><a href="${formUrl}" target="_blank" style="color: #3498db;">${formUrl}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 10px 8px 0; font-weight: bold;">✅ Form Status:</td>
                <td style="padding: 8px 0;">${isSaved ? 'Active' : '⚠️ Under Construction'}</td>
              </tr>
            </table>
            ${!isSaved ? '<div style="background-color: #fff3cd; padding: 10px; border-radius: 4px; margin: 10px 0; color: #856404;">⚠️ Note: This form is currently being built and the link may change after final save.</div>' : ''}
            <p>Please click the link above to access and submit the form.</p>
            <p>Thank you for your participation.</p>
            <p style="margin-top: 20px;">Best regards,<br><strong>Form Administrator</strong></p>
          </div>
        `;
        break;
      case 'invite':
        content = `
          <div style="font-family: Arial, Helvetica, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2c3e50;">Form Invitation</h2>
            <p>Dear User,</p>
            <p>You are cordially invited to complete the "<strong>${formName}</strong>" form.</p>
            <h3 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 5px;">Form Details</h3>
            <table style="border-collapse: collapse; margin: 15px 0; width: 100%;">
              <tr style="border-bottom: 1px solid #ecf0f1;">
                <td style="padding: 8px 10px 8px 0; font-weight: bold; width: 140px;">📝 Form Name:</td>
                <td style="padding: 8px 0;">${formName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #ecf0f1;">
                <td style="padding: 8px 10px 8px 0; font-weight: bold;">🔗 Access Link:</td>
                <td style="padding: 8px 0;"><a href="${formUrl}" target="_blank" style="color: #3498db;">${formUrl}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 10px 8px 0; font-weight: bold;">📅 Status:</td>
                <td style="padding: 8px 0;">${isSaved ? 'Open for submissions' : 'Under Construction'}</td>
              </tr>
            </table>
            ${!isSaved ? '<div style="background-color: #fff3cd; padding: 10px; border-radius: 4px; margin: 10px 0; color: #856404;">⚠️ Note: The form is currently being built. The final link will be shared once the form is ready.</div>' : ''}
            <p>Please submit the form at your earliest convenience.</p>
            <p style="margin-top: 20px;">Best regards,<br><strong>Form Administrator</strong></p>
          </div>
        `;
        break;
      case 'reminder':
        content = `
          <div style="font-family: Arial, Helvetica, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2c3e50;">Form Reminder</h2>
            <p>Dear User,</p>
            <p>This is a friendly reminder to complete the "<strong>${formName}</strong>" form.</p>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 15px 0;">
              <p style="font-size: 16px; margin: 0;"><strong>🔗 Form Link:</strong> <a href="${formUrl}" target="_blank" style="color: #3498db;">${formUrl}</a></p>
            </div>
            <p style="color: #7f8c8d; font-style: italic;">If you have already submitted the form, please ignore this message.</p>
            <p>Thank you for your cooperation.</p>
            <p style="margin-top: 20px;">Best regards,<br><strong>Form Administrator</strong></p>
          </div>
        `;
        break;
      default:
        content = `
          <div style="font-family: Arial, Helvetica, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2c3e50;">Form Access</h2>
            <p>Hello,</p>
            <p>Please access the form using the following link:</p>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 15px 0;">
              <a href="${formUrl}" target="_blank" style="color: #3498db; font-size: 16px;">${formUrl}</a>
            </div>
            <p style="margin-top: 20px;">Best regards,<br><strong>Form Administrator</strong></p>
          </div>
        `;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { margin: 0; padding: 0; background-color: #f4f4f4; }
          @media only screen and (max-width: 480px) {
            table { width: 100% !important; }
          }
        </style>
      </head>
      <body>
        ${content}
      </body>
      </html>
    `;
  };

  const handleHtmlFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['text/html', 'text/plain', 'application/xhtml+xml'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (!validTypes.includes(file.type) && !['html', 'htm', 'txt'].includes(fileExtension)) {
      alert('Please upload a valid HTML file (.html, .htm, or .txt)');
      return;
    }

    setHtmlFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      setUploadedHtmlFile(content);
      setHtmlMessage(content);
      setUseHtml(true);
    };
    reader.onerror = () => {
      alert('Error reading file. Please try again.');
    };
    reader.readAsText(file);
    
    e.target.value = '';
  };

  useEffect(() => {
    if (isOpen && formData) {
      setUploadedHtmlFile(null);
      setHtmlFileName('');
      setHtmlMessage(getHtmlTemplate());
    }
  }, [isOpen]);

  const handleSaveAndSend = async () => {
    if (!recipientEmail) {
      alert('Please enter recipient email address');
      return;
    }

    setIsSaving(true);
    
    try {
      if (onSaveAndSend) {
        const saveResult = await onSaveAndSend();
        if (!saveResult.success) {
          throw new Error(saveResult.error || 'Failed to save form');
        }
      }
      
      setLoading(true);
      
      const htmlContent = useHtml ? htmlMessage : message.replace(/\n/g, '<br>');
      
      const response = await fetch('https://tableware-dweeb-estate.ngrok-free.dev/api/email/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: recipientEmail,
          subject: subject,
          message: message,
          htmlMessage: htmlContent,
          isHtml: true
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        alert('✅ Form saved and email sent successfully!');
        onClose();
        setRecipientEmail('');
        setUploadedHtmlFile(null);
        setHtmlFileName('');
      } else {
        throw new Error(result.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ ' + error.message);
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  };

  const handleSendOnly = async () => {
    if (!recipientEmail) {
      alert('Please enter recipient email address');
      return;
    }

    setLoading(true);
    
    try {
      const htmlContent = useHtml ? htmlMessage : message.replace(/\n/g, '<br>');
      
      const response = await fetch('https://tableware-dweeb-estate.ngrok-free.dev/api/email/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: recipientEmail,
          subject: subject,
          message: message,
          htmlMessage: htmlContent,
          isHtml: true
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        alert('✅ Email sent successfully!');
        onClose();
        setRecipientEmail('');
        setUploadedHtmlFile(null);
        setHtmlFileName('');
      } else {
        throw new Error(result.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('❌ Failed to send email: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onClose();
    setUploadedHtmlFile(null);
    setHtmlFileName('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <Mail className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-800">Share Form Link</h2>
          </div>
          <button
            onClick={handleSkip}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".html,.htm,.txt"
          onChange={handleHtmlFileUpload}
          className="hidden"
        />

        {!formData?.isSaved && (
          <div className="bg-yellow-50 p-4 border-b border-yellow-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="text-yellow-800 font-medium">Form not saved yet!</p>
                <p className="text-yellow-600 text-sm">You need to save the form before sharing. Click "Save & Send" to save and share.</p>
              </div>
            </div>
          </div>
        )}

        {formData?.isSaved && (
          <div className="bg-green-50 p-4 border-b border-green-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-green-800 font-medium">Form saved successfully!</p>
                <p className="text-green-600 text-sm">You can now share the form link.</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={(e) => e.preventDefault()} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Type
              </label>
              <select
                value={emailType}
                onChange={(e) => {
                  setEmailType(e.target.value);
                  setSubject(getDefaultSubject());
                  if (!uploadedHtmlFile) {
                    setHtmlMessage(getHtmlTemplate());
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="share">Share Form Link</option>
                <option value="invite">Invitation to Fill Form</option>
                <option value="reminder">Reminder Email</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To:
              </label>
              <input
                ref={emailInputRef}
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                required
                placeholder="recipient@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject:
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Message:
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 px-3 py-1 bg-indigo-500 hover:bg-indigo-600 text-white text-sm rounded-lg transition"
                >
                  <Upload size={14} />
                  Upload HTML Emailer
                </button>
                {uploadedHtmlFile && (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <FileText size={14} />
                    {htmlFileName}
                  </span>
                )}
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={useHtml}
                    onChange={(e) => {
                      setUseHtml(e.target.checked);
                      if (e.target.checked && !uploadedHtmlFile) {
                        setHtmlMessage(getHtmlTemplate());
                      }
                    }}
                    className="rounded"
                  />
                  <span>Use HTML</span>
                </label>
              </div>
            </div>
            
            {useHtml ? (
              <HTMLEmailEditor
                value={htmlMessage}
                onChange={setHtmlMessage}
              />
            ) : (
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-sm text-blue-800 mb-2">Form Link:</h4>
            <div className="text-xs text-blue-700 space-y-1 break-all">
              <p><strong>Form Name:</strong> {formData?.name || 'Form'}</p>
              <p><strong>Form URL:</strong></p>
              <a 
                href={formData?.formUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {formData?.formUrl || 'Will be generated after saving'}
              </a>
            </div>
            {!formData?.isSaved && (
              <p className="text-xs text-yellow-600 mt-2">
                ⚠️ The form needs to be saved first. Click "Save & Send" to save and share.
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleSkip}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            
            {!formData?.isSaved ? (
              <button
                type="button"
                onClick={handleSaveAndSend}
                disabled={isSaving || loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {(isSaving || loading) ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
                {(isSaving || loading) ? 'Saving & Sending...' : 'Save & Send'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSendOnly}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {loading ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
                {loading ? 'Sending...' : 'Send Link'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================== Settings Panel Component ====================
const SettingsPanel = ({ isOpen, onClose, settings, onSettingsChange }) => {
  if (!isOpen) return null;

  const handleChange = (key, value) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  const handleNestedChange = (parentKey, childKey, value) => {
    onSettingsChange({
      ...settings,
      [parentKey]: {
        ...settings[parentKey],
        [childKey]: value
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Form Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700">Form Name</h3>
            <input
              type="text"
              value={settings.formName}
              onChange={(e) => handleChange('formName', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter form name"
            />
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700">Form Status</h3>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="formStatus"
                  value="enable"
                  checked={settings.formStatus === 'enable'}
                  onChange={(e) => handleChange('formStatus', e.target.value)}
                  className="mr-2"
                />
                Enable
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="formStatus"
                  value="disable"
                  checked={settings.formStatus === 'disable'}
                  onChange={(e) => handleChange('formStatus', e.target.value)}
                  className="mr-2"
                />
                Disable
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700">Data Encryption</h3>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.encryptFormData}
                onChange={(e) => handleChange('encryptFormData', e.target.checked)}
                className="mr-2"
              />
              Encrypt form data
            </label>
            <p className="text-sm text-gray-500">
              Encrypt all form submissions for enhanced security
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700">Form Warnings</h3>
            <textarea
              value={settings.formWarnings}
              onChange={(e) => handleChange('formWarnings', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="Enter warning messages for form users..."
            />
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700">Language Settings</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Language
              </label>
              <select
                value={settings.primaryLanguage}
                onChange={(e) => handleChange('primaryLanguage', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="hi">Hindi</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.multipleLanguages}
                  onChange={(e) => handleChange('multipleLanguages', e.target.checked)}
                  className="mr-2"
                />
                Enable Multiple Languages
              </label>
              <p className="text-sm text-gray-500">
                Allow form to be displayed in multiple languages
              </p>
            </div>

            {settings.multipleLanguages && (
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.enableTranslator}
                    onChange={(e) => handleChange('enableTranslator', e.target.checked)}
                    className="mr-2"
                  />
                  Enable Auto-Translator
                </label>
                <p className="text-sm text-gray-500">
                  Automatically translate form content using AI
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700">Auto Delete Submissions</h3>
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={settings.autoDelete.enabled}
                onChange={(e) => handleNestedChange('autoDelete', 'enabled', e.target.checked)}
                className="mr-2"
              />
              Enable automatic deletion
            </label>
            
            {settings.autoDelete.enabled && (
              <div className="space-y-3 ml-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delete Condition
                  </label>
                  <select
                    value={settings.autoDelete.condition}
                    onChange={(e) => handleNestedChange('autoDelete', 'condition', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="duplicate">Duplicate Entries</option>
                    <option value="date">After Specific Date</option>
                    <option value="days">After Number of Days</option>
                  </select>
                </div>

                {settings.autoDelete.condition === 'date' && (
                  <input
                    type="date"
                    value={settings.autoDelete.date}
                    onChange={(e) => handleNestedChange('autoDelete', 'date', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}

                {settings.autoDelete.condition === 'days' && (
                  <input
                    type="number"
                    value={settings.autoDelete.days}
                    onChange={(e) => handleNestedChange('autoDelete', 'days', parseInt(e.target.value) || 0)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Number of days"
                  />
                )}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700">Unique Submissions</h3>
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={settings.uniqueSubmission.enabled}
                onChange={(e) => handleNestedChange('uniqueSubmission', 'enabled', e.target.checked)}
                className="mr-2"
              />
              Prevent multiple submissions
            </label>
            
            {settings.uniqueSubmission.enabled && (
              <div className="space-y-2 ml-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.uniqueSubmission.useCookies}
                    onChange={(e) => handleNestedChange('uniqueSubmission', 'useCookies', e.target.checked)}
                    className="mr-2"
                  />
                  Use Cookies
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.uniqueSubmission.useIP}
                    onChange={(e) => handleNestedChange('uniqueSubmission', 'useIP', e.target.checked)}
                    className="mr-2"
                  />
                  Use IP Address
                </label>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700">Unique Field Validation</h3>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.uniqueField.enabled}
                onChange={(e) => handleNestedChange('uniqueField', 'enabled', e.target.checked)}
                className="mr-2"
              />
              Don't allow previously entered values for specific fields
            </label>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700">Accessibility</h3>
            <button
              onClick={() => {
                handleChange('checkAccessibility', true);
                alert('Accessibility check completed! Your form meets basic WCAG guidelines.');
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Check Form Accessibility
            </button>
            <p className="text-sm text-gray-500">
              Analyze your form for accessibility issues and WCAG compliance
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700">Hidden Field Values</h3>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Clear values for fields hidden by conditional logic:
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="clearHiddenFields"
                    value="clearWhenHide"
                    checked={settings.clearHiddenFields === 'clearWhenHide'}
                    onChange={(e) => handleChange('clearHiddenFields', e.target.value)}
                    className="mr-2"
                  />
                  Clear When Hide
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="clearHiddenFields"
                    value="clearWhenSubmitted"
                    checked={settings.clearHiddenFields === 'clearWhenSubmitted'}
                    onChange={(e) => handleChange('clearHiddenFields', e.target.value)}
                    className="mr-2"
                  />
                  Clear When Submitted
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="clearHiddenFields"
                    value="dontClear"
                    checked={settings.clearHiddenFields === 'dontClear'}
                    onChange={(e) => handleChange('clearHiddenFields', e.target.value)}
                    className="mr-2"
                  />
                  Don't Clear
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700">Form Layout</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="formLayout"
                  value="singlePage"
                  checked={settings.formLayout === 'singlePage'}
                  onChange={(e) => handleChange('formLayout', e.target.value)}
                  className="mr-2"
                />
                All Questions in One Page
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="formLayout"
                  value="multiPage"
                  checked={settings.formLayout === 'multiPage'}
                  onChange={(e) => handleChange('formLayout', e.target.value)}
                  className="mr-2"
                />
                Single Question Per Page
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700">Error Navigation</h3>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.showErrorNavigation}
                onChange={(e) => handleChange('showErrorNavigation', e.target.checked)}
                className="mr-2"
              />
              Allow navigation between form errors
            </label>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700">Form Cloning</h3>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.preventCloning}
                onChange={(e) => handleChange('preventCloning', e.target.checked)}
                className="mr-2"
              />
              Prevent other users from cloning this form
            </label>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700">Browser Autocomplete</h3>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.allowBrowserAutocomplete}
                onChange={(e) => handleChange('allowBrowserAutocomplete', e.target.checked)}
                className="mr-2"
              />
              Allow browsers to store and autocomplete form fields
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            <Save size={16} />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== Pop Component ====================
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
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Form Created Successfully!</h2>
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

// ==================== RuleBuilder Component ====================
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

// ==================== SignaturePad Component ====================
const SignaturePad = ({ element, previewMode = false, onSignatureChange }) => {
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
    if (!previewMode) return;
    
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
    if (!isDrawing || !previewMode) return;

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
    if (!isDrawing || !previewMode) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL();
    onSignatureChange(dataURL);
  };

  const clearSignature = () => {
    if (!previewMode) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onSignatureChange(null);
  };

  return (
    <div className="space-y-2">
      <canvas
        ref={canvasRef}
        width={400}
        height={200}
        className={`border-2 border-dashed border-gray-300 rounded-lg w-full ${
          previewMode ? 'cursor-crosshair' : 'cursor-not-allowed opacity-50'
        }`}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
      />
      {previewMode && (
        <button
          onClick={clearSignature}
          className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm"
        >
          Clear Signature
        </button>
      )}
    </div>
  );
};

// ==================== Main FormBuilder Component ====================
const FormBuilder = () => {
  const navigate = useNavigate();
  const { id } = useParams();
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
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [formDataForEmail, setFormDataForEmail] = useState(null);
  const [formRules, setFormRules] = useState([]);
  const [visibilityMap, setVisibilityMap] = useState({});
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({
    formName: "Untitled Form",
    formStatus: "enable",
    encryptFormData: false,
    formWarnings: "",
    primaryLanguage: "en",
    multipleLanguages: false,
    enableTranslator: false,
    autoDelete: {
      enabled: false,
      condition: "duplicate",
      date: "",
      days: 30
    },
    uniqueSubmission: {
      enabled: false,
      useCookies: true,
      useIP: false
    },
    uniqueField: {
      enabled: false
    },
    clearHiddenFields: "clearWhenHide",
    formLayout: "singlePage",
    showErrorNavigation: true,
    preventCloning: false,
    allowBrowserAutocomplete: true,
    checkAccessibility: false
  });

  const currentStep = steps[currentStepIndex];
  const currentElements = currentStep.elements;

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
          initialVisibility[el.id] = false;
        });
      });
      setVisibilityMap(initialVisibility);
      applyRules();
    }
  }, [previewMode, steps]);

  const getFieldValue = (element) => {
    if (!element) return null;

    switch (element.type) {
      case "full-name":
      case "email":
      case "phone":
        return element.value || null;
      case "date":
        return element.selectedDate || null;
      case "time":
        return element.selectedTime || null;
      case "address":
        return element.street1 || null;
      case "aadhar":
        return element.aadharNumber || null;
      case "passport":
        return element.passportNumber || null;
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
        return element.selectedOption || null;
      case "multiple-choice":
        return element.selectedOptions || [];
      default:
        return null;
    }
  };

  const evaluateCondition = (condition) => {
    if (!condition.field) return false;

    let currentValue = null;
    for (const step of steps) {
      const element = step.elements.find(el => el.id === condition.field);
      if (element) {
        currentValue = getFieldValue(element);
        break;
      }
    }

    if (currentValue === null) return false;

    if (condition.fieldType === 'date' || condition.fieldType === 'time') {
      const currentDate = new Date(currentValue);
      const conditionDate = new Date(condition.value);

      switch (condition.state) {
        case "Is Filled":
          return !!currentValue;
        case "Is Empty":
          return !currentValue;
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

    switch (condition.state) {
      case "Is Filled":
        return !!currentValue;
      case "Is Empty":
        return !currentValue;
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

    steps.forEach(step => {
      step.elements.forEach(el => {
        if (newVisibilityMap[el.id] === undefined) {
          newVisibilityMap[el.id] = false;
        }
      });
    });

    formRules.forEach(rule => {
      rule.actions.forEach(action => {
        if (action.target) {
          newVisibilityMap[action.target] = false;
        }
      });
    });

    formRules.forEach(rule => {
      const ruleResult = evaluateRule(rule);

      if (ruleResult) {
        rule.actions.forEach(action => {
          if (action.target) {
            newVisibilityMap[action.target] = action.action === "Show";
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

    if (previewMode) {
      setVisibilityMap(prev => ({
        ...prev,
        [newElement.id]: false
      }));
    }
  };

  const createFormElement = (type) => {
    const id = Date.now().toString();

    if (previewMode) {
      setVisibilityMap(prev => ({
        ...prev,
        [id]: false
      }));
    }

    switch (type) {
      case "heading":
        return { id, type, text: "Heading Text", level: "h2", description: "" };
      case "full-name":
        return {
          id,
          type,
          label: "Full Name",
          placeholder: "Enter your full name",
          description: "",
          required: false
        };
      case "email":
        return {
          id,
          type,
          label: "Email",
          placeholder: "email@example.com",
          description: "",
          required: false
        };
      case "nearest-airport":
        return {
          id,
          type,
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
          required: false
        };
      case "address":
        return {
          id,
          type,
          label: "Address",
          street1: "",
          street2: "",
          city: "",
          state: "",
          postalCode: "",
          description: "",
          required: false
        };
      case "phone":
        return {
          id,
          type,
          label: "Phone",
          placeholder: "(123) 456-7890",
          description: "",
          required: false
        };
      case "date":
        return {
          id,
          type,
          label: "Date",
          selectedDate: "",
          description: "",
          required: false
        };
      case "download-document":
        return {
          id,
          type,
          label: "Download Document",
          document: null,
          description: "",
          buttonText: "Download",
          required: false
        };
      case "time":
        return {
          id,
          type,
          label: "Time",
          selectedTime: "",
          description: "",
          required: false
        };
      case "signature":
        return {
          id,
          type,
          label: "Signature",
          signatureData: null,
          description: "",
          required: false
        };
      case "paragraph":
        return {
          id,
          type,
          content: "Paragraph text...",
          description: ""
        };
      case "dropdown":
        return {
          id,
          type,
          label: "Dropdown",
          options: ["Option 1"],
          description: "",
          required: false
        };
      case "single-choice":
        return {
          id,
          type,
          label: "Single Choice",
          options: ["Option 1"],
          description: "",
          required: false
        };
      case "multiple-choice":
        return {
          id,
          type,
          label: "Multiple Choice",
          options: ["Option 1"],
          description: "",
          required: false
        };
      case "file-upload":
        return {
          id,
          type,
          label: "File Upload",
          file: null,
          description: "",
          required: false
        };
      case "star-rating":
        return {
          id,
          type,
          label: "Star Rating",
          rating: 0,
          maxRating: 5,
          description: "",
          required: false
        };
      case "scale-rating":
        return {
          id,
          type,
          label: "Scale Rating",
          value: 5,
          min: 1,
          max: 10,
          description: "",
          required: false
        };
      case "divider":
        return {
          id,
          type,
          description: ""
        };
      case "aadhar":
        return {
          id,
          type,
          label: "Aadhar Card",
          aadharNumber: "",
          name: "",
          dob: "",
          gender: "",
          address: "",
          frontImage: null,
          backImage: null,
          description: "",
          required: false
        };
      case "passport":
        return {
          id,
          type,
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
          required: false
        };
      case "banner":
        return {
          id,
          type,
          label: "Banner",
          bannerImage: null,
          height: 200,
          description: ""
        };
      case "hyperlink":
        return {
          id,
          type,
          text: "Click here",
          url: "https://example.com",
          description: "",
          openInNewTab: false
        };
      case "image-gallery":
        return {
          id,
          type,
          label: "Image Gallery",
          images: [],
          description: "",
          layout: "grid",
          columns: 3
        };
      case "ocr-aadhar":
        return {
          id,
          type,
          label: "OCR Aadhar Card",
          aadharNumber: "",
          name: "",
          dob: "",
          gender: "",
          address: "",
          frontImage: null,
          backImage: null,
          description: "",
          required: false
        };
      case "ocr-password":
        return {
          id,
          type,
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
          required: false
        };
      default:
        return {
          id,
          type,
          label: type,
          description: "",
          required: false
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
                <div>
                  <label htmlFor="" className="mb-2">Date of Birth</label>
                  <br />
                  <input
                    type="date"
                    value={element.dob}
                    onChange={(e) => handleElementChange(element.id, { dob: e.target.value })}
                    className="p-2 border rounded"
                    placeholder="Date of Birth"
                  />
                </div>
                <div>
                  <label htmlFor="" className="mb-2">Place of Birth</label>
                  <br/>
                  <input
                    type="text"
                    value={element.placeOfBirth}
                    onChange={(e) => handleElementChange(element.id, { placeOfBirth: e.target.value })}
                    className="p-2 border rounded"
                    placeholder="Place of Birth"
                  />  
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div> 
                  <label htmlFor="" className="mb-2">Issue Date</label>
                  <br/>
                  <input
                    type="date"
                    value={element.issueDate}
                    onChange={(e) => handleElementChange(element.id, { issueDate: e.target.value })}
                    className="p-2 border rounded"
                    placeholder="Issue Date"
                  />
                </div>
                <div>
                  <label htmlFor="" className="mb-2">Expiry Date</label>
                  <br/>
                  <input
                    type="date"
                    value={element.expiryDate}
                    onChange={(e) => handleElementChange(element.id, { expiryDate: e.target.value })}
                    className="p-2 border rounded"
                    placeholder="Expiry Date"
                  />
                </div>
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
            <div className="p-4 bg-gray-100 rounded border">
              <p className="text-sm text-gray-600 mb-2">
                Signature pad will be available in preview mode. Users can draw their signature directly.
              </p>
              {element.signatureData && (
                <div className="mt-2">
                  <p className="text-sm font-medium mb-1">Current Signature:</p>
                  <img
                    src={element.signatureData}
                    alt="Signature preview"
                    className="border rounded max-h-32"
                  />
                </div>
              )}
            </div>
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
            <SignaturePad 
              element={element} 
              previewMode={previewMode}
              onSignatureChange={(signatureData) => 
                handleElementChange(element.id, { signatureData })
              }
            />
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

  const handleSaveForm = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      if (!id) {
        throw new Error("Lead ID is missing");
      }

      const formData = {
        lead_id: parseInt(id),
        name: formName,
        steps: steps.map(step => ({
          name: step.name,
          elements: step.elements.map(element => {
            const elementClone = JSON.parse(JSON.stringify(element));
            delete elementClone.signaturePadRef;

            return {
              id: elementClone.id,
              type: elementClone.type,
              config: elementClone
            };
          })
        })),
        elementStyles: JSON.parse(JSON.stringify(elementStyles)),
        rules: formRules.map(rule => ({
          ...rule,
          conditions: rule.conditions.map(cond => ({
            field: cond.field,
            operator: cond.state,
            value: cond.value,
            fieldType: cond.fieldType,
            logic: cond.logic
          })),
          actions: rule.actions.map(action => ({
            action: action.action.toLowerCase(),
            target: action.target
          }))
        })),
        settings: settings
      };

      const cleanFormData = JSON.parse(JSON.stringify(formData, (key, value) =>
        value === null || value === undefined ? '' : value
      ));

      const response = await fetch('https://tableware-dweeb-estate.ngrok-free.dev/api/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(cleanFormData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save form');
      }

      const data = await response.json();
      
      const formUrlGenerated = data.formUrl || `https://tableware-dweeb-estate.ngrok-free.dev/operations/SharedFormView/${data.shareId}`;
      setFormUrl(formUrlGenerated);
      
      setFormDataForEmail({
        name: formName,
        formUrl: formUrlGenerated,
        steps: steps,
        settings: settings,
        lead_id: id,
        isSaved: true
      });
      
      setSaveSuccess(true);
      
      return { success: true, formUrl: formUrlGenerated };
      
    } catch (error) {
      setSaveError(error.message);
      console.error('Error saving form:', error);
      return { success: false, error: error.message };
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
      { label: "Short Answers", type: "full-name" },
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

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center justify-between bg-orange-500 text-white px-6 py-3">
        <div className="flex items-center space-x-6">
          <div className="font-bold text-lg">Form Builder</div>
          <button onClick={() => navigate(-1)} className="btn btn-secondary">
            ← Back
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <button
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded"
            onClick={() => {
              const tempFormUrl = formUrl || `${window.location.origin}/forms/builder/${id}`;
              
              setFormDataForEmail({
                name: formName,
                formUrl: tempFormUrl,
                steps: steps,
                settings: settings,
                lead_id: id,
                isSaved: !!formUrl
              });
              setIsEmailModalOpen(true);
            }}
          >
            <Mail size={16} />
            <span>Send Link</span>
          </button>
          <button
            className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-1 rounded"
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings size={16} />
            <span>Settings</span>
          </button>

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
            {isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save Form"}
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
          <div className="w-[20rem] bg-gray-900 text-white flex flex-col h-[100vh] scrollbar-none">
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
          className={`p-6 overflow-auto bg-gray-100 ${previewMode ? "flex-1" : "w-[81%]"
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

      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingsChange={setSettings}
      />

      <EmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        formData={formDataForEmail}
        onSaveAndSend={handleSaveForm}
      />
    </div>
  );
};

export default FormBuilder;