export interface Comment {
    //id?: number;                  // Identifiant du commentaire
    content: string;             // Contenu du commentaire
    createdAt: Date;           // Date de création du commentaire (au format ISO 8601, par exemple '2025-05-01T14:30:00')
    updatedAt: Date;           // Date de mise à jour du commentaire (au format ISO 8601)
    //taskId: number;              // ID de la tâche associée (au lieu de l'objet Task complet)
    author?: {
        id: number;
        username: string;
        email?: string;
      };              // ID de l'auteur du commentaire (au lieu de l'objet User complet)
  }