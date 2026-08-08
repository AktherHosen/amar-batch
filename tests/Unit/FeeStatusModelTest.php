<?php

namespace Tests\Unit;

use App\Models\Batch;
use App\Models\FeeStatus;
use App\Models\Student;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FeeStatusModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_fee_status_belongs_to_student()
    {
        $feeStatus = FeeStatus::factory()->create();
        $this->assertInstanceOf(Student::class, $feeStatus->student);
    }

    public function test_fee_status_belongs_to_batch()
    {
        $feeStatus = FeeStatus::factory()->create();
        $this->assertInstanceOf(Batch::class, $feeStatus->batch);
    }
}
