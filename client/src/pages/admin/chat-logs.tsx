import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchChatLogs } from "@/lib/api";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, User, Bot, ChevronDown, ChevronUp, Loader2, Clock } from "lucide-react";

interface ChatSession {
  sessionId: string;
  userType: string | null;
  userName: string | null;
  startedAt: string;
  messages: Array<{
    id: number;
    role: string;
    content: string;
    createdAt: string;
  }>;
}

export default function ChatLogs() {
  const { data: sessions = [], isLoading } = useQuery<ChatSession[]>({
    queryKey: ["/api/chat-logs"],
    queryFn: fetchChatLogs,
  });
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  const toggleSession = (sessionId: string) => {
    setExpandedSession(prev => (prev === sessionId ? null : sessionId));
  };

  const getUserTypeBadge = (userType: string | null) => {
    switch (userType) {
      case "admin":
        return <Badge data-testid="badge-user-type-admin" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">Admin</Badge>;
      case "site":
        return <Badge data-testid="badge-user-type-site" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">Site</Badge>;
      default:
        return <Badge data-testid="badge-user-type-anonymous" variant="outline">Anonymous</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 data-testid="text-chat-logs-title" className="text-3xl font-heading font-bold text-primary flex items-center gap-2">
            <MessageCircle className="h-8 w-8" />
            AI Chat Logs
          </h1>
          <p className="text-muted-foreground">Review chatbot conversations and analyze user questions.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p data-testid="text-total-sessions" className="text-2xl font-bold">{sessions.length}</p>
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p data-testid="text-total-messages" className="text-2xl font-bold">
                    {sessions.reduce((acc, s) => acc + s.messages.length, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Messages</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p data-testid="text-unique-users" className="text-2xl font-bold">
                    {new Set(sessions.map(s => s.userName || "Anonymous")).size}
                  </p>
                  <p className="text-sm text-muted-foreground">Unique Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Chat Sessions</CardTitle>
            <CardDescription>Click on a session to expand and view the conversation.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] w-full pr-4">
              {sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground opacity-50">
                  <MessageCircle className="h-12 w-12 mb-4" />
                  <p>No chat sessions found.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div
                      key={session.sessionId}
                      data-testid={`card-chat-session-${session.sessionId}`}
                      className="border rounded-lg overflow-hidden"
                    >
                      <button
                        data-testid={`button-expand-session-${session.sessionId}`}
                        onClick={() => toggleSession(session.sessionId)}
                        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{session.userName || "Anonymous"}</span>
                              {getUserTypeBadge(session.userType)}
                              <Badge variant="outline" className="text-xs">
                                {session.messages.length} msgs
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                              <Clock className="h-3 w-3" />
                              {formatDate(session.startedAt)}
                            </div>
                          </div>
                        </div>
                        {expandedSession === session.sessionId ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>

                      {expandedSession === session.sessionId && (
                        <div className="border-t bg-muted/20 p-4 space-y-3">
                          {session.messages.map((msg) => (
                            <div
                              key={msg.id}
                              data-testid={`chat-log-message-${msg.id}`}
                              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                                  msg.role === "user"
                                    ? "bg-blue-600 text-white rounded-br-md"
                                    : "bg-white dark:bg-gray-800 border rounded-bl-md"
                                }`}
                              >
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                <p className={`text-[10px] mt-1 ${
                                  msg.role === "user" ? "text-blue-200" : "text-muted-foreground"
                                }`}>
                                  {new Date(msg.createdAt).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
