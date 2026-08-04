<?php

namespace Tests\Unit;

use App\Models\Attendance;
use App\Models\Batch;
use App\Models\Enrollment;
use App\Models\FeeStatus;
use App\Models\Student;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_has_enrollments()
    {
        $student = Student::factory()->create();
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class, $student->enrollments());
    }

    public function test_student_has_fee_statuses()
    {
        $student = Student::factory()->create();
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class, $student->feeStatuses());
    }

    public function test_student_has_attendances()
    {
        $student = Student::factory()->create();
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class, $student->attendances());
    }

    public function test_student_belongs_to_coaching_class()
    {
        $student = Student::factory()->create();
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\BelongsTo::class, $student->coachingClass());
    }
}
