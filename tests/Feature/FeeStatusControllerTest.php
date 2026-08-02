<?php

namespace Tests\Feature;

use App\Models\Batch;
use App\Models\FeeStatus;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FeeStatusControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_login()
    {
        $response = $this->get(route('fees.index'));
        $response->assertRedirect(route('login'));
    }

    public function test_admin_can_view_fees_index()
    {
        $user = User::factory()->create(['role' => 'admin']);
        $this->actingAs($user);

        $response = $this->get(route('fees.index'));
        $response->assertOk();
    }

    public function test_admin_can_create_fee_status()
    {
        $user = User::factory()->create(['role' => 'admin']);
        $this->actingAs($user);

        $student = Student::factory()->create();
        $batch = Batch::factory()->create();

        $response = $this->post(route('fees.store'), [
            'student_id' => $student->id,
            'batch_id' => $batch->id,
            'amount_paid' => 100,
            'amount_due' => 0,
            'status' => 'paid',
            'payment_date' => '2026-08-02',
        ]);

        $response->assertRedirect(route('fees.index'));
        $this->assertDatabaseHas('fee_statuses', [
            'student_id' => $student->id,
            'batch_id' => $batch->id,
            'amount_paid' => 100,
            'status' => 'paid',
        ]);
    }

    public function test_admin_can_update_fee_status()
    {
        $user = User::factory()->create(['role' => 'admin']);
        $this->actingAs($user);

        $fee = FeeStatus::factory()->create(['amount_paid' => 100]);

        $response = $this->put(route('fees.update', $fee->id), [
            'student_id' => $fee->student_id,
            'batch_id' => $fee->batch_id,
            'amount_paid' => 200,
            'amount_due' => 0,
            'status' => 'paid',
        ]);

        $response->assertRedirect(route('fees.index'));
        $this->assertDatabaseHas('fee_statuses', [
            'id' => $fee->id,
            'amount_paid' => 200,
        ]);
    }

    public function test_admin_can_delete_fee_status()
    {
        $user = User::factory()->create(['role' => 'admin']);
        $this->actingAs($user);

        $fee = FeeStatus::factory()->create();

        $response = $this->delete(route('fees.destroy', $fee->id));
        $response->assertRedirect(route('fees.index'));
        $this->assertDatabaseMissing('fee_statuses', ['id' => $fee->id]);
    }

    public function test_teacher_cannot_view_fees_index()
    {
        $user = User::factory()->create(['role' => 'teacher']);
        $this->actingAs($user);

        $response = $this->get(route('fees.index'));
        $response->assertForbidden();
    }

    public function test_teacher_cannot_create_fee_status()
    {
        $user = User::factory()->create(['role' => 'teacher']);
        $this->actingAs($user);

        $student = Student::factory()->create();
        $batch = Batch::factory()->create();

        $response = $this->post(route('fees.store'), [
            'student_id' => $student->id,
            'batch_id' => $batch->id,
            'amount_paid' => 100,
            'status' => 'paid',
        ]);

        $response->assertForbidden();
    }

    public function test_student_cannot_view_fees_index()
    {
        $student = Student::factory()->create();
        $user = User::factory()->create(['role' => 'student', 'student_id' => $student->id]);
        $this->actingAs($user);

        $response = $this->get(route('fees.index'));
        $response->assertForbidden();
    }
}
