<?php

namespace Tests\Unit;

use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_be_admin()
    {
        $user = User::factory()->create(['role' => 'admin']);
        $this->assertTrue($user->isAdmin());
        $this->assertFalse($user->isTeacher());
        $this->assertFalse($user->isStudent());
    }

    public function test_user_can_be_teacher()
    {
        $user = User::factory()->create(['role' => 'teacher']);
        $this->assertTrue($user->isTeacher());
        $this->assertFalse($user->isAdmin());
        $this->assertFalse($user->isStudent());
    }

    public function test_user_can_be_student()
    {
        $user = User::factory()->create(['role' => 'student']);
        $this->assertTrue($user->isStudent());
        $this->assertFalse($user->isAdmin());
        $this->assertFalse($user->isTeacher());
    }

    public function test_user_has_student_relationship()
    {
        $student = Student::factory()->create();
        $user = User::factory()->create(['role' => 'student', 'student_id' => $student->id]);
        $this->assertInstanceOf(Student::class, $user->student);
    }

    public function test_user_has_assigned_batches_relationship()
    {
        $user = User::factory()->create(['role' => 'teacher']);
        $this->assertInstanceOf(BelongsToMany::class, $user->assignedBatches());
    }
}
