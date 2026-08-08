<?php

namespace Tests\Unit;

use App\Models\Attendance;
use App\Models\Batch;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AttendanceModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_attendance_belongs_to_student()
    {
        $attendance = Attendance::factory()->create();
        $this->assertInstanceOf(Student::class, $attendance->student);
    }

    public function test_attendance_belongs_to_batch()
    {
        $attendance = Attendance::factory()->create();
        $this->assertInstanceOf(Batch::class, $attendance->batch);
    }

    public function test_attendance_belongs_to_marked_by_user()
    {
        $attendance = Attendance::factory()->create();
        $this->assertInstanceOf(User::class, $attendance->markedBy);
    }
}
