/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useRef, useEffect } from "react";
import { FileText, Edit3, Save, X } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const CommentSection = ({
  commentaire,
  isLoading,
  commande,
  mutateCommande,
  mutateCommandes,
  mutateCommentaire,
  showNotification,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      const length = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(length, length);
    }
  }, [isEditing]);

  const handleEdit = () => {
    const currentComment = commentaire || "";
    setEditValue(currentComment);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue("");
  };

  const handleSave = async () => {
    if (!commande) return;

    setIsSaving(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/public/commandes/commentaire/${commande.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ commentaire: editValue.trim() }),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du commentaire");
      }

      const updatedCommande = await response.json();

      mutateCommentaire(editValue.trim() || null, false);
      mutateCommande(updatedCommande, false);
      mutateCommandes();

      setIsEditing(false);
      showNotification("Commentaire mis à jour avec succès", "success");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du commentaire:", error);
      showNotification("Erreur lors de la mise à jour du commentaire", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <div className="details-info-card">
      <div className="details-card-header">
        <FileText size={20} />
        <h3>Commentaire</h3>
        {!isLoading && !isEditing && (
          <button
            className="details-comment-edit-btn"
            onClick={handleEdit}
            title="Modifier le commentaire"
          >
            <Edit3 size={16} />
          </button>
        )}
      </div>
      <div className="details-card-content">
        <div className="details-comment-item">
          {isLoading ? (
            <div className="comment-loading-state">
              <div className="comment-loading-spinner"></div>
              <span className="comment-loading-text">
                Chargement du commentaire...
              </span>
            </div>
          ) : isEditing ? (
            <div className="comment-edit-container">
              <textarea
                ref={textareaRef}
                className="comment-edit-textarea"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Saisissez votre commentaire..."
                rows={4}
                maxLength={1000}
              />
              <div className="comment-edit-actions">
                <button
                  className="details-btn details-btn-primary details-btn-sm"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <div className="details-btn-spinner"></div>
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      Sauvegarder
                    </>
                  )}
                </button>
                <button
                  className="details-btn details-btn-secondary details-btn-sm"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  <X size={14} />
                  Annuler
                </button>
              </div>
              <div className="comment-char-count">
                {editValue.length}/1000 caractères
              </div>
            </div>
          ) : (
            <span className="details-comment-value">
              {!commentaire ? (
                <span className="comment-empty-state">Aucun commentaire</span>
              ) : (
                <span className="comment-content">{commentaire}</span>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentSection;
