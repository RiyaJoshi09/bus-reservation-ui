import { Component, inject} from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { AdminProfileComponent } from '../admin-profile/admin-profile.component';
import { UserProfileComponent } from '../user-profile/user-profile.component';

@Component({
  selector: 'app-profile-page',
  imports: [UserProfileComponent, AdminProfileComponent],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss'
})
export class ProfilePageComponent {
  auth = inject(AuthService);
}
