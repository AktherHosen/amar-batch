<?php

namespace Tests\Feature;

use App\Models\Batch;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BatchControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_login()
    {
        $response = $this->get(route('batches.index'));
        $response->assertForbidden();
    }

    public function test_admin_can_view_batches_index()
    {
        $user = User::factory()->create(['role' => 'admin']);
        $this->actingAs($user);

        $response = $this->get(route('batches.index'));
        $response->assertOk();
    }

    public function test_admin_can_create_batch()
    {
        $user = User::factory()->create(['role' => 'admin']);
        $this->actingAs($user);

        $response = $this->post(route('batches.store'), [
            'name' => 'Morning Batch',
            'capacity' => 30,
            'status' => 'active',
            'fees_amount' => 500,
        ]);

        $response->assertRedirect(route('batches.index'));
        $this->assertDatabaseHas('batches', ['name' => 'Morning Batch']);
    }

    public function test_admin_can_update_batch()
    {
        $user = User::factory()->create(['role' => 'admin']);
        $this->actingAs($user);

        $batch = Batch::factory()->create(['name' => 'Original Name']);

        $response = $this->put(route('batches.update', $batch->id), [
            'name' => 'Updated Name',
            'capacity' => 30,
            'status' => 'active',
            'fees_amount' => 500,
        ]);

        $response->assertRedirect(route('batches.show', $batch->id));
        $this->assertDatabaseHas('batches', ['id' => $batch->id, 'name' => 'Updated Name']);
    }

    public function test_admin_can_delete_batch()
    {
        $user = User::factory()->create(['role' => 'admin']);
        $this->actingAs($user);

        $batch = Batch::factory()->create();

        $response = $this->delete(route('batches.destroy', $batch->id));
        $response->assertRedirect(route('batches.index'));
        $this->assertSoftDeleted('batches', ['id' => $batch->id]);
    }

    public function test_admin_can_assign_teacher_to_batch()
    {
        $user = User::factory()->create(['role' => 'admin']);
        $this->actingAs($user);

        $batch = Batch::factory()->create();
        $teacher = User::factory()->create(['role' => 'teacher']);

        $response = $this->post(route('batches.assign-teacher', $batch->id), [
            'teacher_id' => $teacher->id,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('teacher_batch', [
            'batch_id' => $batch->id,
            'teacher_id' => $teacher->id,
        ]);
    }

    public function test_admin_can_remove_teacher_from_batch()
    {
        $user = User::factory()->create(['role' => 'admin']);
        $this->actingAs($user);

        $batch = Batch::factory()->create();
        $teacher = User::factory()->create(['role' => 'teacher']);
        $batch->teachers()->attach($teacher->id, ['assigned_at' => now()]);

        $response = $this->delete(route('batches.remove-teacher', $batch->id), [
            'teacher_id' => $teacher->id,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseMissing('teacher_batch', [
            'batch_id' => $batch->id,
            'teacher_id' => $teacher->id,
        ]);
    }

    public function test_teacher_cannot_create_batch()
    {
        $user = User::factory()->create(['role' => 'teacher']);
        $this->actingAs($user);

        $response = $this->post(route('batches.store'), [
            'name' => 'Test Batch',
            'capacity' => 30,
            'status' => 'active',
        ]);

        $response->assertForbidden();
    }
}
