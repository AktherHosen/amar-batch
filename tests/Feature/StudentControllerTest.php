<?php

namespace Tests\Feature;

use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_login()
    {
        $response = $this->get(route('students.index'));
        $response->assertForbidden();
    }

    public function test_admin_can_view_students_index()
    {
        $user = User::factory()->create(['role' => 'admin']);
        $this->actingAs($user);

        $response = $this->get(route('students.index'));
        $response->assertOk();
    }

    public function test_teacher_can_view_students_index()
    {
        $user = User::factory()->create(['role' => 'teacher']);
        $this->actingAs($user);

        $response = $this->get(route('students.index'));
        $response->assertOk();
    }

    public function test_student_cannot_view_students_index()
    {
        $student = Student::factory()->create();
        $user = User::factory()->create(['role' => 'student', 'student_id' => $student->id]);
        $this->actingAs($user);

        $response = $this->get(route('students.index'));
        $response->assertForbidden();
    }

    public function test_admin_can_create_student()
    {
        $user = User::factory()->create(['role' => 'admin']);
        $this->actingAs($user);

        $response = $this->post(route('students.store'), [
            'name' => 'Test Student',
            'phone' => '555-0199',
            'status' => 'active',
        ]);

        $response->assertRedirect(route('students.index'));
        $this->assertDatabaseHas('students', ['name' => 'Test Student']);
    }

    public function test_admin_can_update_student()
    {
        $user = User::factory()->create(['role' => 'admin']);
        $this->actingAs($user);

        $student = Student::factory()->create(['name' => 'Original Name']);

        $response = $this->put(route('students.update', $student->id), [
            'name' => 'Updated Name',
            'status' => 'active',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('students', ['id' => $student->id, 'name' => 'Updated Name']);
    }

    public function test_admin_can_delete_student()
    {
        $user = User::factory()->create(['role' => 'admin']);
        $this->actingAs($user);

        $student = Student::factory()->create();

        $response = $this->delete(route('students.destroy', $student->id));
        $response->assertRedirect();
        $this->assertDatabaseMissing('students', ['id' => $student->id, 'deleted_at' => null]);
    }

    public function test_teacher_cannot_create_student()
    {
        $user = User::factory()->create(['role' => 'teacher']);
        $this->actingAs($user);

        $response = $this->post(route('students.store'), [
            'name' => 'Test Student',
            'status' => 'active',
        ]);

        $response->assertForbidden();
    }
}
