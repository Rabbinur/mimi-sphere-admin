"use client";

import { useGetBackupListQuery, useGetServerLogsQuery } from "@/components/Redux/RTK/serverLogApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Database, Download, FileText, History, RefreshCcw, Search, ShieldCheck, Terminal, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const ServerLogsPage = () => {
  const [logType, setLogType] = useState("combined");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: logsData, isLoading: logsLoading, refetch: refetchLogs, isFetching: logsFetching } = useGetServerLogsQuery(logType);
  const { data: backupData, isLoading: backupLoading, refetch: refetchBackups } = useGetBackupListQuery({});

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && !searchQuery) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logsData, searchQuery]);

  const handleDownloadLog = () => {
    const element = document.createElement("a");
    const file = new Blob([logsData?.data || ""], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${logType}-logs-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(element);
    element.click();
  };

  const handleDownloadBackup = (fileName: string) => {
    window.open(`${process.env.NEXT_PUBLIC_API_BASE_URL}/server-logs/backups/download?fileName=${fileName}`, '_blank');
  };

  // Filter logs based on search query
  const filteredLogs = logsData?.data?.split('\n').filter((line: string) =>
    line.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="p-4 md:p-8 bg-white min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">


        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-blue-600" /> Maintenance Center
          </h1>
          <p className="text-slate-500 text-sm">Monitor system health and manage data backups</p>
        </div>
      </div>


      <Tabs defaultValue="logs" className="w-full">
        <TabsList className="bg-white border shadow-sm mb-4 p-1">
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Terminal className="w-4 h-4" /> System Logs
          </TabsTrigger>
          <TabsTrigger value="backups" className="flex items-center gap-2">
            <Database className="w-4 h-4" /> DB Backups
          </TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-xl border shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <Select value={logType} onValueChange={setLogType}>
                <SelectTrigger className="w-[180px] bg-slate-50">
                  <SelectValue placeholder="Select log type" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="combined">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" /> Combined Activity
                    </div>
                  </SelectItem>
                  <SelectItem value="error">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" /> Error Logs
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Search Box */}
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  placeholder="Search in logs..."
                  className="pl-10 w-[250px] bg-slate-50 border-slate-200 focus:bg-white transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3 text-slate-500" />
                  </button>
                )}
              </div>

              <Button variant="outline" size="sm" onClick={() => refetchLogs()} disabled={logsFetching}>
                <RefreshCcw className={`w-4 h-4 mr-2 ${logsFetching ? 'animate-spin' : ''}`} /> Sync
              </Button>
            </div>
            <Button size="sm" onClick={handleDownloadLog} className="bg-slate-900 hover:bg-slate-800">
              <Download className="w-4 h-4 mr-2" /> Download TXT
            </Button>
          </div>

          <Card className="border-none shadow-xl overflow-hidden">
            <CardHeader className="bg-slate-800 text-slate-100 border-b border-slate-700 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5 mr-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-xs font-mono text-slate-400">bash — logs/{logType}.log {searchQuery && `(Filtered: ${filteredLogs.length} lines)`}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 bg-[#0d1117]">
              <div ref={scrollRef} className="h-[600px] overflow-y-auto p-4 font-mono text-sm custom-scrollbar">
                {logsLoading ? (
                  <div className="flex items-center justify-center h-full text-slate-500 animate-pulse font-sans">
                    Initializing terminal stream...
                  </div>
                ) : filteredLogs.length > 0 ? (
                  <pre className="whitespace-pre-wrap">
                    {filteredLogs.map((line: string, i: number) => {
                      const isError = line.toLowerCase().includes('error');
                      const isWarn = line.toLowerCase().includes('warn');
                      const isInfo = line.toLowerCase().includes('info');

                      return (
                        <div key={i} className={`py-0.5 border-l-2 pl-3 mb-0.5 transition-colors ${isError ? 'border-red-500 text-red-400 bg-red-500/5' :
                          isWarn ? 'border-yellow-500 text-yellow-400 bg-yellow-500/5' :
                            isInfo ? 'border-blue-500 text-blue-400' :
                              'border-transparent text-slate-300 hover:bg-slate-800/50'
                          }`}>
                          <span className="text-slate-600 mr-3 select-none w-10 inline-block text-right">{i + 1}</span>
                          {line}
                        </div>
                      )
                    })}
                  </pre>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 font-sans space-y-2">
                    <Search className="w-8 h-8 opacity-20" />
                    <p>No log lines match your search criteria</p>
                    <Button variant="link" size="sm" onClick={() => setSearchQuery("")} className="text-blue-400">Clear filter</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backups" className="space-y-4">
          <Card className="border-none shadow-lg overflow-hidden">
            <CardHeader className="border-b bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-slate-900">Restore Points (Last 3 Backups)</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetchBackups()}>
                  <RefreshCcw className="w-4 h-4 mr-2" /> Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b">
                    <tr>
                      <th className="px-6 py-4 font-medium">Archive Identifier</th>
                      <th className="px-6 py-4 font-medium">Data Size</th>
                      <th className="px-6 py-4 font-medium">Timestamp</th>
                      <th className="px-6 py-4 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y bg-white">
                    {backupLoading ? (
                      <tr><td colSpan={4} className="p-10 text-center animate-pulse text-slate-400">Retrieving backup manifest...</td></tr>
                    ) : backupData?.data?.length > 0 ? (
                      backupData.data.map((file: any) => (
                        <tr key={file.name} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs text-blue-600">{file.name}</td>
                          <td className="px-6 py-4 font-medium">{file.size}</td>
                          <td className="px-6 py-4 text-slate-500">{new Date(file.at).toLocaleString()}</td>
                          <td className="px-6 py-4 text-right">
                            <Button size="sm" onClick={() => handleDownloadBackup(file.name)} className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                              <Download className="w-3.5 h-3.5 mr-2" /> Pull ZIP
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={4} className="p-10 text-center text-slate-400">No backup snapshots found on the storage node</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl flex gap-4 items-start shadow-sm">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-sm text-blue-800">
              <p className="font-bold text-blue-900 mb-1">Data Retention Policy:</p>
              <ul className="list-disc ml-4 space-y-1 opacity-90">
                <li>Automated snapshots are triggered daily at 03:00 AM local time.</li>
                <li>The system maintains only the 3 most recent snapshots to optimize disk space.</li>
                <li>Archives are stored as compressed JSON structures within a ZIP wrapper.</li>
              </ul>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ServerLogsPage;


