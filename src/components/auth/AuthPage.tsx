'use client';

import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="flex justify-center items-center">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLogin ? <LoginForm /> : <RegisterForm onRegisterSuccess={() => setIsLogin(true)} />}
          <div className="mt-6 text-center">
            <Button variant="link" onClick={() => setIsLogin(!isLogin)} className="text-sm text-primary hover:text-primary/80">
              {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
