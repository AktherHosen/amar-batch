<?php

namespace Tests\Unit;

use App\Models\Batch;
use App\Models\Enrollment;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BatchModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_batch_has_teachers()
    {
        $batch = Batch::factory()->create();
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\BelongsToMany::class, $batch->teachers());
    }

    public function test_batch_has_enrollments()
    {
        $batch = Batch::factory()->create();
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class, $batch->enrollments());
    }

    public function test_batch_has_students()
    {
        $batch = Batch::factory()->create();
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\BelongsToMany::class, $batch->students());
    }

    public function test_batch_has_fee_statuses()
    {
        $batch = Batch::factory()->create();
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class, $batch->feeStatuses());
    }

    public function test_batch_has_attendances()
    {
        $batch = Batch::factory()->create();
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class, $batch->attendances());
    }
}
