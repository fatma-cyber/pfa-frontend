import { Pipe, PipeTransform } from '@angular/core';
import { Task, TaskStatus } from '../model/Task.model';

@Pipe({
  name: 'filter',
  standalone: true
})
export class FilterPipe implements PipeTransform {
  transform(items: Task[], field: string, value: any, searchText?: string, showOverdue?: boolean): any[] {
    if (!items || !items.length) return [];
    
    return items.filter(task => {
      // Filtre par statut
      let statusMatch = false;
      if (typeof task.status === 'string') {
        statusMatch = task.status.toUpperCase() === value.toString();
      } else {
        statusMatch = task.status === value;
      }
      
      // Filtre par texte
      const searchMatch = !searchText || 
        task.title.toLowerCase().includes(searchText.toLowerCase()) ||
        task.description.toLowerCase().includes(searchText.toLowerCase());
      
      // Filtre des tâches en retard
      const isOverdue = task.deadline ? 
        (new Date(task.deadline) < new Date() && task.status !== TaskStatus.DONE) : false;
      
      const overdueMatch = !showOverdue || isOverdue;
      
      return statusMatch && searchMatch && (showOverdue ? overdueMatch : true);
    });
  }
}