<?php

namespace Tests\Unit;

use App\Models\Batch;
use App\Models\Enrollment;
use App\Models\Student;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EnrollmentModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_enrollment_belongs_to_student()
    {
        $enrollment = Enrollment::factory()->create();
        $this->assertInstanceOf(Student::class, $enrollment->student);
    }

    public function test_enrollment_belongs_to_batch()
    {
        $enrollment = Enrollment::factory()->create();
        $this->assertInstanceOf(Batch::class, $enrollment->batch);
    }
}
