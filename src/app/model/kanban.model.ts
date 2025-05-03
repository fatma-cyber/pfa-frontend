/**
 * Interface représentant un projet Kanban
 */
export interface Kanban {
    /**
     * Identifiant unique du kanban
     */
    id?: number;
    
    /**
     * Nom du projet
     */
    name: string;
    
    /**
     * Description détaillée du projet
     */
    description: string;
    
    /**
     * Date de début du projet (format YYYY-MM-DD)
     */
    startDate?: string;
    
    /**
     * Date de fin prévue du projet (format YYYY-MM-DD) 
     */
    endDate?: string;
    
    /**
     * Informations sur le créateur du projet
     */
    creator?: {
      id: number;
      username: string;
      email?: string;
    };
    
    /**
     * Nom d'utilisateur du créateur (pour l'affichage)
     */
    creatorUsername?: string;
    
    /**
     * Liste des tâches associées au projet (version simplifiée pour les aperçus)
     */
    tasks?: TaskSummary[];
    
    /**
     * Date de création dans le système
     */
    createdAt?: string;
    
    /**
     * Date de dernière modification
     */
    updatedAt?: string;
    
    /**
     * Indique si l'utilisateur courant est le créateur du projet
     * Utilisé pour les permissions et l'affichage
     */
    isCreator?: boolean;
    
    /**
     * Rôle de l'utilisateur courant dans le projet (Créateur ou Assigné)
     */
    role?: string;
}
  
/**
 * Résumé d'une tâche pour l'affichage dans les listes
 */
export interface TaskSummary {
  id: number;
  title: string;
  status: string;
  priority?: string;
  deadline?: string;
  assignee?: {
    id: number;
    username: string;
    email?: string;
  };
}