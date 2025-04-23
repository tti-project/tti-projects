import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Invitation } from '../../../core/models/invitation.model';

@Injectable({
  providedIn: 'root'
})
export class InvitationService {
  private apiUrl = `${environment.apiUrl}/invitations`;

  constructor(private http: HttpClient) { }

  sendInvitation(data: {
    email: string;
    workspaceId: string;
    projectId?: string;
    role: string;
  }): Observable<Invitation> {
    return this.http.post<Invitation>(this.apiUrl, data);
  }

  getInvitations(): Observable<Invitation[]> {
    return this.http.get<Invitation[]>(this.apiUrl);
  }

  acceptInvitation(invitationId: string): Observable<Invitation> {
    return this.http.post<Invitation>(`${this.apiUrl}/accept/${invitationId}`, {});
  }

  rejectInvitation(invitationId: string): Observable<Invitation> {
    return this.http.post<Invitation>(`${this.apiUrl}/reject/${invitationId}`, {});
  }
}
