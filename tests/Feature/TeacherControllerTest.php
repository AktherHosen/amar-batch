<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeacherControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_login()
    {
        $response = $this->get(route('teachers.index'));
        $response->assertStatus(500);
    }

    public function test_admin_can_view_teachers_index()
    {
        $user = User::factory()->create(['role' => 'admin']);
        $this->actingAs($user);

        $response = $this->get(route('teachers.index'));
        $response->assertOk();
    }

    public function test_admin_can_create_teacher()
    {
        $user = User::factory()->create(['role' => 'admin']);
        $this->actingAs($user);

        $response = $this->post(route('teachers.store'), [
            'name' => 'Test Teacher',
            'email' => 'test@teacher.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertRedirect(route('teachers.index'));
        $this->assertDatabaseHas('users', ['email' => 'test@teacher.com', 'role' => 'teacher']);
    }

    public function test_admin_can_update_teacher()
    {
        $user = User::factory()->create(['role' => 'admin']);
        $this->actingAs($user);

        $teacher = User::factory()->create(['role' => 'teacher', 'name' => 'Original Name']);

        $response = $this->put(route('teachers.update', $teacher->id), [
            'name' => 'Updated Name',
            'email' => $teacher->email,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', ['id' => $teacher->id, 'name' => 'Updated Name']);
    }

    public function test_admin_can_delete_teacher()
    {
        $user = User::factory()->create(['role' => 'admin']);
        $this->actingAs($user);

        $teacher = User::factory()->create(['role' => 'teacher']);

        $response = $this->delete(route('teachers.destroy', $teacher->id));
        $response->assertRedirect();
        $this->assertDatabaseHas('users', ['id' => $teacher->id, 'role' => 'inactive']);
    }

    public function test_teacher_cannot_view_teachers_index()
    {
        $user = User::factory()->create(['role' => 'teacher']);
        $this->actingAs($user);

        $response = $this->get(route('teachers.index'));
        $response->assertForbidden();
    }

    public function test_teacher_cannot_create_teacher()
    {
        $user = User::factory()->create(['role' => 'teacher']);
        $this->actingAs($user);

        $response = $this->post(route('teachers.store'), [
            'name' => 'Test Teacher',
            'email' => 'test@teacher.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertForbidden();
    }
}
