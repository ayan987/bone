import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { TimesheetService } from '../../services/timesheet/timesheet.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../shared/services/auth/auth.service';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrl: './comment.component.scss'
})
export class CommentComponent implements OnInit {
  @Input() commentData: any;
  @Output() showCommentBox = new EventEmitter<boolean>();
  profilePicUrl: string | undefined = localStorage.getItem('profilePicUrl') ?? '';
  createCommentForm = this.fb.group({
    id: [''],
    userEmail: [''],
    userName: [''],
    timesheetId: [''],
    comment: ['',[Validators.required, Validators.maxLength(1000)]],
    createdAt: [''],
    timestamp: [''],
    updatedAt: [''],
    status: [''],
  });

  constructor(private readonly fb: FormBuilder, private readonly timesheetService: TimesheetService, private readonly toastr: ToastrService, private readonly authService: AuthService) {}
  ngOnInit(): void {
    this.populateDataInForm();
    console.log(this.commentData);
  }

  populateDataInForm(): void {
    if(this.commentData != null || this.commentData != undefined) {
      this.createCommentForm.patchValue({
        id: this.commentData.id,
        userEmail: this.commentData.userEmail,
        userName: this.commentData.userName,
        timesheetId: this.commentData.timesheetId,
        timestamp: this.commentData.timestamp,
        comment: this.commentData.comment,
        createdAt: this.commentData.createdAt,
        updatedAt: this.commentData.updatedAt,
        status: this.commentData.status
      });
    }
  }

  cancelComment(): void {
    this.showCommentBox.emit(false);
  }

  saveComment(): void {
    const comment = this.createCommentForm.value;
    if (comment && !comment.id) {
      this.saveCommentApi(comment);
    } else {
      this.editCommentApi(comment);
    }
  }

  saveCommentApi(comment: any): void {
    this.timesheetService.addComment(comment).subscribe({
      next: (response: any) => {
        if (response.status === 201) {
          this.toastr.success('Comment added successfully');
          this.createCommentForm.reset();
          this.showCommentBox.emit(false);
        }
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  editCommentApi(comment: any): void {
    this.timesheetService.editCommentByStatus(comment).subscribe({
      next: (response: any) => {
        if (response.status === 200) {
          this.toastr.success('Comment edited successfully');
          this.createCommentForm.reset();
          this.showCommentBox.emit(false);
        }
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }


}
