<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function docs(): Response
    {
        return Inertia::render('docs');
    }

    public function contact(): Response
    {
        return Inertia::render('contact');
    }

    public function terms(): Response
    {
        return Inertia::render('terms');
    }

    public function privacy(): Response
    {
        return Inertia::render('privacy');
    }
}
