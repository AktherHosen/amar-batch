<?php

namespace Tests\Unit;

use App\Models\Attendance;
use App\Models\Batch;
use App\Models\Enrollment;
use App\Models\FeeStatus;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_has_user()
    {
        $student = Student::factory()->create();
        $user = User::factory()->create(['role' => 'student', 'student_id' => $student->id]);
        $this->assertNotNull($student->user);
    }

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
}
