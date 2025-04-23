import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Invitation } from '../models/invitation.model';

@Injectable({
  providedIn: 'root'
})
export class InvitationService {
  private apiUrl = `${environment.apiUrl}/invitations`;

  constructor(private http: HttpClient) { }

  getInvitations(): Observable<Invitation[]> {
    return this.http.get<Invitation[]>(this.apiUrl);
  }

  acceptInvitation(invitationId: string): Observable<Invitation> {
    return this.http.post<Invitation>(`${this.apiUrl}/${invitationId}/accept`, {});
  }

  rejectInvitation(invitationId: string): Observable<Invitation> {
    return this.http.post<Invitation>(`${this.apiUrl}/${invitationId}/reject`, {});
  }
}
