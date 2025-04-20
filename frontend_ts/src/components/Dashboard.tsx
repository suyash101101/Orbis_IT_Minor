import { ArrowDown, ArrowRight, ArrowUp, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Acme Inc.</h1>
        <span className="text-sm text-muted-foreground">Documents</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue Card */}
        <Card className="border-primary/30 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">$1,250.00</span>
              <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary flex items-center">
                <ArrowUp className="h-3 w-3 mr-1" />
                +12.5%
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>Trending up this month</span>
            </div>
            <CardDescription className="text-xs mt-1">Visitors for the last 6 months</CardDescription>
          </CardContent>
        </Card>

        {/* New Customers Card */}
        <Card className="border-secondary/30 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">New Customers</CardTitle>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">1,234</span>
              <span className="text-xs px-2 py-1 rounded-full bg-destructive/10 text-destructive flex items-center">
                <ArrowDown className="h-3 w-3 mr-1" />
                -20%
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowDown className="h-3 w-3 mr-1" />
              <span>Down 20% this period</span>
            </div>
            <CardDescription className="text-xs mt-1">Acquisition needs attention</CardDescription>
          </CardContent>
        </Card>

        {/* Active Accounts Card */}
        <Card className="border-accent/30 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Accounts</CardTitle>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">45,678</span>
              <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary flex items-center">
                <ArrowUp className="h-3 w-3 mr-1" />
                +12.5%
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>Strong user retention</span>
            </div>
            <CardDescription className="text-xs mt-1">Engagement exceed targets</CardDescription>
          </CardContent>
        </Card>

        {/* Growth Rate Card */}
        <Card className="border-primary/30 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Growth Rate</CardTitle>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">4.5%</span>
              <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary flex items-center">
                <ArrowUp className="h-3 w-3 mr-1" />
                +12.5%
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowRight className="h-3 w-3 mr-1" />
              <span>Steady performance</span>
            </div>
            <CardDescription className="text-xs mt-1">Meets growth projections</CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Area Chart for Total Visitors */}
      <Card className="border-primary/30 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Total Visitors</CardTitle>
              <CardDescription>Total for the last 3 months</CardDescription>
            </div>
            <div className="flex space-x-2">
              <div className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">Last 3 months</div>
              <div className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">Last 30 days</div>
              <div className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">Last 7 days</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-60 w-full bg-gradient-to-b from-chart-1/20 to-chart-3/20 relative">
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              Area chart visualization would go here
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Tabs */}
      <div className="flex gap-2 mt-4">
        <div className="text-sm px-4 py-2 rounded bg-accent/20 text-accent-foreground">Outline</div>
        <div className="text-sm px-4 py-2 rounded bg-secondary/20 text-secondary-foreground flex items-center">
          Past Performance
          <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground">3</span>
        </div>
        <div className="text-sm px-4 py-2 rounded bg-primary/20 text-primary-foreground flex items-center">
          Key Personnel
          <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground">2</span>
        </div>
        <div className="text-sm px-4 py-2 rounded bg-muted text-muted-foreground">Focus Documents</div>
      </div>
    </div>
  );
} 