<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\Batch;
use App\Models\Enrollment;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AttendanceControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_login()
    {
        $response = $this->get(route('attendance.index'));
        $response->assertRedirect(route('login'));
    }

    public function test_admin_can_view_attendance_index()
    {
        $user = User::factory()->create(['role' => 'admin']);
        $this->actingAs($user);

        $response = $this->get(route('attendance.index'));
        $response->assertOk();
    }

    public function test_teacher_can_view_attendance_index()
    {
        $user = User::factory()->create(['role' => 'teacher']);
        $this->actingAs($user);

        $response = $this->get(route('attendance.index'));
        $response->assertOk();
    }

    public function test_student_can_view_attendance_index()
    {
        $student = Student::factory()->create();
        $user = User::factory()->create(['role' => 'student', 'student_id' => $student->id]);
        $this->actingAs($user);

        $response = $this->get(route('attendance.index'));
        $response->assertOk();
    }

    public function test_admin_can_mark_attendance()
    {
        $user = User::factory()->create(['role' => 'admin']);
        $this->actingAs($user);

        $batch = Batch::factory()->create();
        $student = Student::factory()->create();
        Enrollment::factory()->create(['student_id' => $student->id, 'batch_id' => $batch->id, 'status' => 'active']);

        $response = $this->post(route('attendance.store'), [
            'batch_id' => $batch->id,
            'date' => now()->toDateString(),
            'attendances' => [
                [
                    'student_id' => $student->id,
                    'status' => 'present',
                ],
            ],
        ]);

        $response->assertRedirect(route('attendance.index'));
        $this->assertDatabaseHas('attendances', [
            'student_id' => $student->id,
            'batch_id' => $batch->id,
            'status' => 'present',
        ]);
    }

    public function test_teacher_can_mark_attendance()
    {
        $user = User::factory()->create(['role' => 'teacher']);
        $this->actingAs($user);

        $batch = Batch::factory()->create();
        $student = Student::factory()->create();
        Enrollment::factory()->create(['student_id' => $student->id, 'batch_id' => $batch->id, 'status' => 'active']);

        $response = $this->post(route('attendance.store'), [
            'batch_id' => $batch->id,
            'date' => now()->toDateString(),
            'attendances' => [
                [
                    'student_id' => $student->id,
                    'status' => 'absent',
                ],
            ],
        ]);

        $response->assertRedirect(route('attendance.index'));
        $this->assertDatabaseHas('attendances', [
            'student_id' => $student->id,
            'batch_id' => $batch->id,
            'status' => 'absent',
        ]);
    }

    public function test_student_cannot_mark_attendance()
    {
        $student = Student::factory()->create();
        $user = User::factory()->create(['role' => 'student', 'student_id' => $student->id]);
        $this->actingAs($user);

        $batch = Batch::factory()->create();
        $otherStudent = Student::factory()->create();

        $response = $this->post(route('attendance.store'), [
            'batch_id' => $batch->id,
            'date' => now()->toDateString(),
            'attendances' => [
                [
                    'student_id' => $otherStudent->id,
                    'status' => 'present',
                ],
            ],
        ]);

        $response->assertForbidden();
    }

    public function test_admin_can_delete_attendance()
    {
        $user = User::factory()->create(['role' => 'admin']);
        $this->actingAs($user);

        $attendance = Attendance::factory()->create();

        $response = $this->delete(route('attendance.destroy', $attendance->id));
        $response->assertRedirect();
        $this->assertDatabaseMissing('attendances', ['id' => $attendance->id]);
    }

    public function test_attendance_is_created_with_correct_status()
    {
        $user = User::factory()->create(['role' => 'admin']);
        $this->actingAs($user);

        $batch = Batch::factory()->create();
        $student = Student::factory()->create();
        Enrollment::factory()->create(['student_id' => $student->id, 'batch_id' => $batch->id, 'status' => 'active']);

        $date = '2026-08-02';

        $this->post(route('attendance.store'), [
            'batch_id' => $batch->id,
            'date' => $date,
            'attendances' => [
                [
                    'student_id' => $student->id,
                    'status' => 'absent',
                ],
            ],
        ]);

        $this->assertDatabaseHas('attendances', [
            'student_id' => $student->id,
            'batch_id' => $batch->id,
            'status' => 'absent',
        ]);
    }
}
