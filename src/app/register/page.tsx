'use client'

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { User as UserIcon, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react"
import Link from "next/link"

// Interfaces para o frontend
interface CreateUserDto {
    email: string;
    name?: string;  // opcional como indicado pelo String? no schema
    password: string;
}
  
interface UserData {
    id: number;
    email: string;
    name?: string;
    createdAt: Date;
    updatedAt: Date;
}

async function createUser(userData: CreateUserDto): Promise<UserData> {
  const response = await fetch('https://nestauth-api-production.up.railway.app/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  
  if (!response.ok) {
    throw new Error(`Erro: ${response.status}`);
  }
  
  const data = await response.json();

  return {
    ...data,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt)
  };
}

export default function Register() {
  // Estados para o formulário
  const [name, setName] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [confirmPassword, setConfirmPassword] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  
  // Router para navegação
  const router = useRouter()

  // Função para lidar com o envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validações
    if (!name.trim()) {
      toast.error("Por favor, insira seu nome")
      return
    }
    
    if (!email.trim()) {
      toast.error("Por favor, insira seu email")
      return
    }
    
    if (!password.trim()) {
      toast.error("Por favor, insira uma senha")
      return
    }
    
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem")
      return
    }
    
    // Iniciar processo de registro
    setLoading(true)
    
    try {
      const userDto: CreateUserDto = {
        name: name,
        email: email,
        password: password
      };
      
      const newUser = await createUser(userDto);
      console.log('Usuário criado:', newUser);
      toast.success("Conta criada com sucesso!");
      
      // Redirecionar para página de login após registro bem-sucedido
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      toast.error(error.message || "Erro ao criar usuário");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-purple-800 text-white p-4 md:p-6 flex items-center justify-center">
      {/* Toast Container */}
      <Toaster richColors closeButton position="top-right" />
      
      <div className="w-full max-w-md">
        {/* Card de registro com efeito de vidro */}
        <div className="backdrop-blur-md bg-white/10 rounded-xl p-8 shadow-lg border border-indigo-700/30">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-200 to-purple-100">
              Criar Conta
            </h1>
            <p className="text-violet-300 mt-2">
              Registre-se para usar o gerenciador de tarefas
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campo de nome */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-violet-300">
                Nome Completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-violet-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="block w-full pl-10 px-3 py-2 bg-indigo-900/40 border border-indigo-700/50 rounded-lg text-white placeholder:text-violet-300/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
            
            {/* Campo de email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-violet-300">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-violet-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full pl-10 px-3 py-2 bg-indigo-900/40 border border-indigo-700/50 rounded-lg text-white placeholder:text-violet-300/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            
            {/* Campo de senha */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-violet-300">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-violet-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className="block w-full pl-10 pr-10 px-3 py-2 bg-indigo-900/40 border border-indigo-700/50 rounded-lg text-white placeholder:text-violet-300/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    className="text-violet-400 hover:text-violet-300 focus:outline-none"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Campo de confirmação de senha */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-violet-300">
                Confirmar Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-violet-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className="block w-full pl-10 px-3 py-2 bg-indigo-900/40 border border-indigo-700/50 rounded-lg text-white placeholder:text-violet-300/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            
            {/* Botão de registro */}
            <div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:opacity-90 text-white transition-all duration-300 border-0 rounded-lg shadow-lg hover:shadow-violet-500/20 flex items-center justify-center gap-2 py-6"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <>
                    <span>Criar Conta</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </form>
          
          {/* Link para login */}
          <div className="mt-6 text-center">
            <p className="text-violet-300">
              Já tem uma conta?{" "}
              <Link href="/login" className="text-white hover:text-violet-200 font-medium">
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}