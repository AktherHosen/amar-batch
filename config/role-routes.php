<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Assignable routes catalog
    |--------------------------------------------------------------------------
    | Groups of assignable route permissions for tenant roles. Keys are route
    | names (supports wildcards). Used by the role editor UI and the
    | role.permission middleware.
    */

    'groups' => [
        'Dashboard' => [
            'dashboard' => 'dashboard',
        ],

        'Students' => [
            'students.index' => 'students.index',
            'students.create' => 'students.create',
            'students.store' => 'students.store',
            'students.show' => 'students.show',
            'students.edit' => 'students.edit',
            'students.update' => 'students.update',
            'students.destroy' => 'students.destroy',
            'students.export' => 'students.export',
        ],

        'Batches' => [
            'batches.index' => 'batches.index',
            'batches.create' => 'batches.create',
            'batches.store' => 'batches.store',
            'batches.show' => 'batches.show',
            'batches.edit' => 'batches.edit',
            'batches.update' => 'batches.update',
            'batches.destroy' => 'batches.destroy',
            'batches.assign-teacher' => 'batches.assign-teacher',
            'batches.remove-teacher' => 'batches.remove-teacher',
            'batches.complete' => 'batches.complete',
            'enrollments.store' => 'enrollments.store',
            'enrollments.update' => 'enrollments.update',
            'enrollments.destroy' => 'enrollments.destroy',
        ],

        'Teachers' => [
            'teachers.index' => 'teachers.index',
            'teachers.create' => 'teachers.create',
            'teachers.store' => 'teachers.store',
            'teachers.show' => 'teachers.show',
            'teachers.edit' => 'teachers.edit',
            'teachers.update' => 'teachers.update',
            'teachers.destroy' => 'teachers.destroy',
            'teachers.approve' => 'teachers.approve',
            'teachers.reject' => 'teachers.reject',
        ],

        'Users' => [
            'users.index' => 'users.index',
            'users.create' => 'users.create',
            'users.store' => 'users.store',
            'users.show' => 'users.show',
            'users.edit' => 'users.edit',
            'users.update' => 'users.update',
            'users.destroy' => 'users.destroy',
            'users.role' => 'users.role',
            'users.deactivate' => 'users.deactivate',
            'users.reactivate' => 'users.reactivate',
            'users.approve' => 'users.approve',
            'users.reject' => 'users.reject',
        ],

        'Attendance' => [
            'attendance.index' => 'attendance.index',
            'attendance.create' => 'attendance.create',
            'attendance.store' => 'attendance.store',
            'attendance.edit' => 'attendance.edit',
            'attendance.update' => 'attendance.update',
            'attendance.destroy' => 'attendance.destroy',
        ],

        'Fees' => [
            'fees.index' => 'fees.index',
            'fees.create' => 'fees.create',
            'fees.store' => 'fees.store',
            'fees.edit' => 'fees.edit',
            'fees.update' => 'fees.update',
            'fees.destroy' => 'fees.destroy',
            'fees.receipts.index' => 'fees.receipts.index',
            'fees.receipts.store' => 'fees.receipts.store',
            'fees.receipts.show' => 'fees.receipts.show',
            'fees.receipts.destroy' => 'fees.receipts.destroy',
        ],

        'Coaching Classes' => [
            'coaching-classes.index' => 'coaching-classes.index',
            'coaching-classes.create' => 'coaching-classes.create',
            'coaching-classes.store' => 'coaching-classes.store',
            'coaching-classes.show' => 'coaching-classes.show',
            'coaching-classes.edit' => 'coaching-classes.edit',
            'coaching-classes.update' => 'coaching-classes.update',
            'coaching-classes.destroy' => 'coaching-classes.destroy',
        ],

        'Exams' => [
            'exams.index' => 'exams.index',
            'exams.create' => 'exams.create',
            'exams.store' => 'exams.store',
            'exams.show' => 'exams.show',
            'exams.edit' => 'exams.edit',
            'exams.update' => 'exams.update',
            'exams.destroy' => 'exams.destroy',
            'exams.results.store' => 'exams.results.store',
        ],

        'Notices' => [
            'notices.index' => 'notices.index',
            'notices.create' => 'notices.create',
            'notices.store' => 'notices.store',
            'notices.show' => 'notices.show',
            'notices.edit' => 'notices.edit',
            'notices.update' => 'notices.update',
            'notices.destroy' => 'notices.destroy',
        ],

        'Holidays' => [
            'holidays.index' => 'holidays.index',
            'holidays.create' => 'holidays.create',
            'holidays.store' => 'holidays.store',
            'holidays.show' => 'holidays.show',
            'holidays.edit' => 'holidays.edit',
            'holidays.update' => 'holidays.update',
            'holidays.destroy' => 'holidays.destroy',
            'holidays.check-date' => 'holidays.check-date',
        ],

        'Reports' => [
            'reports.index' => 'reports.index',
        ],

        'Branches' => [
            'branches.index' => 'branches.index',
            'branches.create' => 'branches.create',
            'branches.store' => 'branches.store',
            'branches.show' => 'branches.show',
            'branches.edit' => 'branches.edit',
            'branches.update' => 'branches.update',
            'branches.destroy' => 'branches.destroy',
        ],

        'SMS' => [
            'sms.settings' => 'sms.settings',
            'sms.settings.update' => 'sms.settings.update',
            'sms.schedules.update' => 'sms.schedules.update',
            'sms.send' => 'sms.send',
            'sms.send.store' => 'sms.send.store',
            'sms.logs' => 'sms.logs',
        ],

        'Settings' => [
            'settings.tenant.edit' => 'settings.tenant.edit',
            'settings.tenant.update' => 'settings.tenant.update',
            'settings.api.index' => 'settings.api.index',
            'settings.api.store' => 'settings.api.store',
            'settings.api.destroy' => 'settings.api.destroy',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Always-allowed routes
    |--------------------------------------------------------------------------
    | Routes every authenticated tenant user can access regardless of role.
    */
    'always_allowed' => [
        'dashboard',
        'notifications.index',
        'notifications.recent',
        'notifications.unread-count',
        'notifications.markAllRead',
        'notifications.markAsRead',
        'profile.edit',
        'profile.update',
        'profile.destroy',
        'user-password.update',
        'security.edit',
        'subscription.index',
        'subscription.upgrade',
        'payment.history',
        'payment.initiate',
        'payment.success',
        'payment.cancel',
        'payment.failure',
        'payment.ipn',
        'onboarding.show',
        'onboarding.store',
        'portal.index',
        'portal.child.show',
        'messages.index',
        'messages.store',
        'messages.show',
        'messages.reply',
        'messages.read',
        'messages.destroy',
    ],

    /*
    |--------------------------------------------------------------------------
    | Feature mapping
    |--------------------------------------------------------------------------
    | Maps route groups to plan feature keys. Groups without a feature
    | mapping are always shown. Groups mapped to a feature are only shown
    | when the tenant's plan includes that feature.
    */
    'feature_map' => [
        'Students' => 'students',
        'Batches' => 'batches',
        'Attendance' => 'attendance',
        'Fees' => 'fees',
        'Coaching Classes' => 'students',
        'Exams' => 'exams',
        'Notices' => 'notifications',
        'Reports' => 'reports',
        'Branches' => 'multi_branch',
        'SMS' => 'sms_notifications',
    ],

    /*
    |--------------------------------------------------------------------------
    | System role defaults
    |--------------------------------------------------------------------------
    | Seed roles created automatically for every new tenant.
    */
    'system_roles' => [
        [
            'name' => 'Owner',
            'slug' => 'owner',
            'description' => 'Full access to the coaching center',
            'permissions' => ['*'],
            'is_system' => true,
        ],
        [
            'name' => 'Staff',
            'slug' => 'staff',
            'description' => 'View batches, mark attendance, working under owner approval',
            'permissions' => [
                'dashboard',
                'students.index',
                'students.show',
                'batches.index',
                'batches.show',
                'attendance.index',
                'attendance.create',
                'attendance.store',
                'coaching-classes.index',
                'coaching-classes.show',
                'exams.index',
                'exams.show',
                'notices.index',
                'notices.show',
                'holidays.index',
                'holidays.show',
                'reports.index',
            ],
            'is_system' => true,
        ],
        [
            'name' => 'Parent',
            'slug' => 'parent',
            'description' => 'View linked children progress via parent portal',
            'permissions' => [],
            'is_system' => true,
        ],
    ],
];