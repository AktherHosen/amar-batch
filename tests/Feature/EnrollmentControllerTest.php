<?php

namespace Tests\Feature;

use App\Models\Batch;
use App\Models\Enrollment;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EnrollmentControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_enroll_student()
    {
        $user = User::factory()->create(['role' => 'admin']);
        $this->actingAs($user);

        $batch = Batch::factory()->create();
        $student = Student::factory()->create();

        $response = $this->post(route('enrollments.store', $batch->id), [
            'student_id' => $student->id,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('enrollments', [
            'student_id' => $student->id,
            'batch_id' => $batch->id,
            'status' => 'active',
        ]);
    }

    public function test_teacher_can_enroll_student()
    {
        $user = User::factory()->create(['role' => 'teacher']);
        $this->actingAs($user);

        $batch = Batch::factory()->create();
        $student = Student::factory()->create();

        $response = $this->post(route('enrollments.store', $batch->id), [
            'student_id' => $student->id,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('enrollments', [
            'student_id' => $student->id,
            'batch_id' => $batch->id,
        ]);
    }

    public function test_student_cannot_enroll_student()
    {
        $student = Student::factory()->create();
        $user = User::factory()->create(['role' => 'student', 'student_id' => $student->id]);
        $this->actingAs($user);

        $batch = Batch::factory()->create();
        $otherStudent = Student::factory()->create();

        $response = $this->post(route('enrollments.store', $batch->id), [
            'student_id' => $otherStudent->id,
        ]);

        $response->assertForbidden();
    }

    public function test_admin_can_update_enrollment_status()
    {
        $user = User::factory()->create(['role' => 'admin']);
        $this->actingAs($user);

        $enrollment = Enrollment::factory()->create(['status' => 'active']);

        $response = $this->put(route('enrollments.update', $enrollment->id), [
            'status' => 'completed',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('enrollments', [
            'id' => $enrollment->id,
            'status' => 'completed',
        ]);
    }

    public function test_admin_can_unenroll_student()
    {
        $user = User::factory()->create(['role' => 'admin']);
        $this->actingAs($user);

        $enrollment = Enrollment::factory()->create();

        $response = $this->delete(route('enrollments.destroy', $enrollment->id));
        $response->assertRedirect();
        $this->assertDatabaseMissing('enrollments', ['id' => $enrollment->id]);
    }

    public function test_cannot_enroll_duplicate_student()
    {
        $user = User::factory()->create(['role' => 'admin']);
        $this->actingAs($user);

        $batch = Batch::factory()->create();
        $student = Student::factory()->create();

        $this->post(route('enrollments.store', $batch->id), [
            'student_id' => $student->id,
        ]);

        $response = $this->post(route('enrollments.store', $batch->id), [
            'student_id' => $student->id,
        ]);

        $response->assertSessionHasErrors();
    }
}
