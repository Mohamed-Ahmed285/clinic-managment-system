import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css'],
})
export class VerifyEmailComponent implements OnInit {
  status: 'verifying' | 'success' | 'error' = 'verifying';
  message = '';

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token') || '';

    if (!token) {
      this.status = 'error';
      this.message = 'This verification link is invalid.';
      return;
    }

    this.authService.verifyEmail(token).subscribe({
      next: () => {
        this.status = 'success';
        this.message = 'Your email has been verified. You can now log in.';
        setTimeout(() => this.router.navigate(['/auth/login']), 2500);
      },
      error: (err: any) => {
        this.status = 'error';

        if (typeof err.error === 'string' && err.error) {
          this.message = err.error;
        } else if (err.error?.message) {
          this.message = err.error.message;
        } else {
          this.message = 'This verification link is invalid or has expired.';
        }
      },
    });
  }
}
