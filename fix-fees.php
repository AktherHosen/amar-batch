<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$students = App\Models\Student::all();
$fixed = 0;
foreach ($students as $student) {
    $activeEnrollments = App\Models\Enrollment::where('student_id', $student->id)->where('status', 'active')->get();
    $droppedEnrollments = App\Models\Enrollment::where('student_id', $student->id)->where('status', 'dropped')->get();
    
    if ($activeEnrollments->count() == 1 && $droppedEnrollments->count() == 1) {
        $activeBatchId = $activeEnrollments->first()->batch_id;
        $droppedBatchId = $droppedEnrollments->first()->batch_id;
        
        $oldFees = App\Models\FeeStatus::where('student_id', $student->id)->where('batch_id', $droppedBatchId)->get();
        foreach ($oldFees as $fee) {
            $targetFee = App\Models\FeeStatus::where('student_id', $student->id)
                ->where('batch_id', $activeBatchId)
                ->where('month', $fee->month)
                ->where('year', $fee->year)
                ->first();
                
            if (!$targetFee) {
                $fee->update(['batch_id' => $activeBatchId]);
                $fixed++;
            } else {
                if ($targetFee->amount_paid == 0 && $targetFee->amount_due == 0) {
                    $targetFee->delete();
                    $fee->update(['batch_id' => $activeBatchId]);
                    $fixed++;
                } else {
                    $targetFee->amount_paid += $fee->amount_paid;
                    $targetFee->amount_due = max($targetFee->amount_due, $fee->amount_due);
                    $targetFee->save();
                    $fee->delete();
                    $fixed++;
                }
            }
        }
    }
}
echo 'Fixed ' . $fixed . ' historical fee records.';
