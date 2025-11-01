import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, ArrowLeft, BookOpen, CheckCircle2, Lock, ChevronRight, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

// Hardcoded lessons data
const HARDCODED_LESSONS = [
  {
    id: "1",
    title: "Advanced React Patterns",
    subject: "React",
    difficulty: "Advanced",
    description: "Master advanced React patterns including render props, HOCs, and compound components.",
    chapters: [
      {
        id: "1-1",
        title: "Render Props Pattern",
        content: `
# Render Props Pattern

The render props pattern is a powerful technique for sharing code between React components using a prop whose value is a function.

## What are Render Props?

A render prop is a function prop that a component uses to know what to render. This pattern allows you to make components highly reusable.

## Key Benefits

- **Flexibility**: Components can be reused with different rendering logic
- **Separation of Concerns**: Logic and presentation are decoupled
- **Composability**: Easy to combine multiple behaviors

## Example Implementation

\`\`\`jsx
class Mouse extends React.Component {
  state = { x: 0, y: 0 };

  handleMouseMove = (event) => {
    this.setState({
      x: event.clientX,
      y: event.clientY
    });
  };

  render() {
    return (
      <div onMouseMove={this.handleMouseMove}>
        {this.props.render(this.state)}
      </div>
    );
  }
}

// Usage
<Mouse render={({ x, y }) => (
  <h1>The mouse position is ({x}, {y})</h1>
)}/>
\`\`\`

## When to Use

- When you need to share stateful logic between components
- When you want maximum flexibility in rendering
- When implementing data providers or wrappers

## Modern Alternative

While still valid, many use cases are now handled by React Hooks, which can be more concise.
        `,
        completed: true
      },
      {
        id: "1-2",
        title: "Higher-Order Components (HOCs)",
        content: `
# Higher-Order Components

HOCs are advanced patterns for reusing component logic. An HOC is a function that takes a component and returns a new component.

## Understanding HOCs

HOCs are a pattern that emerges from React's compositional nature. They're not part of the React API but a pattern that emerges from React's compositional nature.

## Basic Structure

\`\`\`jsx
function withSubscription(WrappedComponent, selectData) {
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        data: selectData(DataSource, props)
      };
    }

    componentDidMount() {
      DataSource.addChangeListener(this.handleChange);
    }

    componentWillUnmount() {
      DataSource.removeChangeListener(this.handleChange);
    }

    handleChange = () => {
      this.setState({
        data: selectData(DataSource, this.props)
      });
    };

    render() {
      return <WrappedComponent data={this.state.data} {...this.props} />;
    }
  };
}
\`\`\`

## Best Practices

1. **Don't mutate the original component** - Use composition
2. **Pass unrelated props through** - HOCs should be transparent
3. **Maximize composability** - HOCs should be composable
4. **Wrap display name** - For debugging purposes

## Common Use Cases

- Authentication and authorization
- Data fetching
- Logging and analytics
- Error boundaries
        `,
        completed: false
      },
      {
        id: "1-3",
        title: "Compound Components",
        content: `
# Compound Components Pattern

Compound components is a pattern where components work together to form a complete UI component.

## The Power of Composition

This pattern allows you to create components that implicitly share state, making for a flexible and intuitive API.

## Example: Tabs Component

\`\`\`jsx
function Tabs({ children }) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  
  return React.Children.map(children, (child, index) => {
    return React.cloneElement(child, {
      isActive: index === activeIndex,
      onActivate: () => setActiveIndex(index)
    });
  });
}

function Tab({ isActive, onActivate, children }) {
  return (
    <button
      className={isActive ? 'active' : ''}
      onClick={onActivate}
    >
      {children}
    </button>
  );
}

// Usage
<Tabs>
  <Tab>First Tab</Tab>
  <Tab>Second Tab</Tab>
  <Tab>Third Tab</Tab>
</Tabs>
\`\`\`

## Advantages

- **Flexible API**: Users can arrange components as needed
- **Implicit State Sharing**: No need for complex prop drilling
- **Clean Syntax**: Reads like native HTML

## Real-World Examples

- Select/Option components
- Menu/MenuItem patterns
- Accordion implementations
- Modal/Dialog systems
        `,
        completed: false
      }
    ]
  },
  {
    id: "2",
    title: "TypeScript Best Practices",
    subject: "TypeScript",
    difficulty: "Intermediate",
    description: "Learn professional TypeScript patterns and best practices for scalable applications.",
    chapters: [
      {
        id: "2-1",
        title: "Type Safety Fundamentals",
        content: `
# Type Safety Fundamentals

TypeScript's type system is one of its most powerful features. Understanding how to use it effectively is crucial.

## Why Type Safety Matters

Type safety helps catch errors at compile time rather than runtime, leading to more robust code.

## Basic Types

\`\`\`typescript
// Primitives
let isDone: boolean = false;
let age: number = 25;
let name: string = "Alex";

// Arrays
let list: number[] = [1, 2, 3];
let list2: Array<number> = [1, 2, 3];

// Tuples
let tuple: [string, number] = ["hello", 10];

// Enums
enum Color {
  Red,
  Green,
  Blue
}
let c: Color = Color.Green;
\`\`\`

## Type Inference

TypeScript can infer types automatically:

\`\`\`typescript
let x = 3; // inferred as number
let y = "hello"; // inferred as string
\`\`\`

## Union Types

\`\`\`typescript
function printId(id: number | string) {
  console.log("Your ID is: " + id);
}
\`\`\`

## Type Aliases

\`\`\`typescript
type Point = {
  x: number;
  y: number;
};

type ID = number | string;
\`\`\`
        `,
        completed: true
      },
      {
        id: "2-2",
        title: "Advanced Types",
        content: `
# Advanced TypeScript Types

Master advanced type features for building complex, type-safe applications.

## Generics

Generics allow you to create reusable components:

\`\`\`typescript
function identity<T>(arg: T): T {
  return arg;
}

let output = identity<string>("myString");
\`\`\`

## Utility Types

TypeScript provides several utility types:

\`\`\`typescript
// Partial - makes all properties optional
type PartialUser = Partial<User>;

// Required - makes all properties required
type RequiredUser = Required<User>;

// Readonly - makes all properties readonly
type ReadonlyUser = Readonly<User>;

// Pick - picks specific properties
type UserNameAndEmail = Pick<User, 'name' | 'email'>;

// Omit - omits specific properties
type UserWithoutPassword = Omit<User, 'password'>;
\`\`\`

## Conditional Types

\`\`\`typescript
type IsString<T> = T extends string ? true : false;

type A = IsString<string>; // true
type B = IsString<number>; // false
\`\`\`

## Mapped Types

\`\`\`typescript
type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};
\`\`\`
        `,
        completed: false
      }
    ]
  },
  {
    id: "3",
    title: "Web Performance Optimization",
    subject: "Performance",
    difficulty: "Advanced",
    description: "Deep dive into web performance optimization techniques and tools.",
    chapters: [
      {
        id: "3-1",
        title: "Performance Metrics",
        content: `
# Understanding Performance Metrics

Learn about key performance metrics and how to measure them.

## Core Web Vitals

Google's Core Web Vitals are essential metrics for web performance:

### Largest Contentful Paint (LCP)
- Measures loading performance
- Should occur within 2.5 seconds

### First Input Delay (FID)
- Measures interactivity
- Should be less than 100 milliseconds

### Cumulative Layout Shift (CLS)
- Measures visual stability
- Should be less than 0.1

## Other Important Metrics

- **First Contentful Paint (FCP)**: When first content appears
- **Time to Interactive (TTI)**: When page becomes fully interactive
- **Total Blocking Time (TBT)**: Sum of all blocking time

## Measuring Performance

\`\`\`javascript
// Using Performance API
const perfData = window.performance.timing;
const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;

// Using Performance Observer
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(entry);
  }
});
observer.observe({ entryTypes: ['measure', 'navigation'] });
\`\`\`
        `,
        completed: true
      }
    ]
  }
];

const LessonViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);

  if (!id) {
    // Show lesson list
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              My Lessons
            </span>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {HARDCODED_LESSONS.map((lesson, idx) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate(`/lessons/${lesson.id}`)}
              >
                <Card className="cursor-pointer hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <BookOpen className="h-8 w-8 text-primary" />
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                        {lesson.difficulty}
                      </span>
                    </div>
                    <CardTitle>{lesson.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{lesson.subject}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {lesson.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{lesson.chapters.length} chapters</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  const lesson = HARDCODED_LESSONS.find(l => l.id === id);
  
  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Lesson not found</h2>
          <Button onClick={() => navigate("/lessons")}>Back to Lessons</Button>
        </div>
      </div>
    );
  }

  const currentChapter = lesson.chapters.find(c => c.id === selectedChapter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/lessons")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/dashboard" className="flex items-center gap-1">
                      <Home className="h-4 w-4" />
                      Dashboard
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/lessons">Lessons</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      {lesson.title}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                  {currentChapter && (
                    <>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage className="flex items-center gap-2">
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            Chapter {lesson.chapters.findIndex(c => c.id === selectedChapter) + 1}
                          </span>
                          {currentChapter.title}
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  )}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium">{lesson.subject}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Badge variant="outline" className="text-xs">
                    {lesson.difficulty}
                  </Badge>
                  <span>•</span>
                  <span>{lesson.chapters.filter(c => c.completed).length}/{lesson.chapters.length} completed</span>
                </div>
              </div>
              <Brain className="h-8 w-8 text-primary" />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chapter Navigation */}
          <Card className="lg:col-span-1 h-fit sticky top-24">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Chapters
                </CardTitle>
                <Badge variant="secondary">
                  {lesson.chapters.filter(c => c.completed).length}/{lesson.chapters.length}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">
                    {Math.round((lesson.chapters.filter(c => c.completed).length / lesson.chapters.length) * 100)}%
                  </span>
                </div>
                <Progress 
                  value={(lesson.chapters.filter(c => c.completed).length / lesson.chapters.length) * 100} 
                  className="h-2" 
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {lesson.chapters.map((chapter, idx) => {
                const isCompleted = chapter.completed;
                const isSelected = selectedChapter === chapter.id;
                const isAccessible = idx === 0 || lesson.chapters[idx - 1].completed;
                
                return (
                  <motion.div
                    key={chapter.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    className="relative"
                  >
                    {/* Progress line */}
                    {idx < lesson.chapters.length - 1 && (
                      <div className={`absolute left-6 top-12 w-0.5 h-8 ${
                        isCompleted ? 'bg-primary' : 'bg-muted'
                      }`} />
                    )}
                    
                    <button
                      onClick={() => isAccessible && setSelectedChapter(chapter.id)}
                      disabled={!isAccessible}
                      className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                        isSelected
                          ? 'bg-primary text-primary-foreground shadow-md'
                          : isAccessible
                            ? 'hover:bg-muted hover:shadow-sm'
                            : 'opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                          isCompleted 
                            ? 'bg-primary text-primary-foreground' 
                            : isSelected
                              ? 'bg-primary-foreground/20 text-primary-foreground'
                              : isAccessible
                                ? 'bg-primary/10 text-primary'
                                : 'bg-muted text-muted-foreground'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : isAccessible ? (
                            idx + 1
                          ) : (
                            <Lock className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium text-sm truncate ${
                            isSelected ? 'text-primary-foreground' : ''
                          }`}>
                            Chapter {idx + 1}
                          </div>
                          <div className={`text-xs truncate ${
                            isSelected 
                              ? 'text-primary-foreground/80' 
                              : 'text-muted-foreground'
                          }`}>
                            {chapter.title}
                          </div>
                        </div>
                        {isSelected && (
                          <ChevronRight className="h-4 w-4 text-primary-foreground" />
                        )}
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>

          {/* Chapter Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {currentChapter ? (
                <motion.div
                  key={currentChapter.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="shadow-lg">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-2xl flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                              {lesson.chapters.findIndex(c => c.id === selectedChapter) + 1}
                            </span>
                            {currentChapter.title}
                          </CardTitle>
                          <p className="text-muted-foreground mt-2">
                            Chapter {lesson.chapters.findIndex(c => c.id === selectedChapter) + 1} of {lesson.chapters.length}
                          </p>
                        </div>
                        {currentChapter.completed && (
                          <Badge className="bg-green-500 hover:bg-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[500px] pr-4">
                        <motion.div 
                          className="prose prose-sm max-w-none dark:prose-invert"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <div className="whitespace-pre-wrap leading-relaxed">{currentChapter.content}</div>
                        </motion.div>
                      </ScrollArea>
                      
                      <motion.div 
                        className="mt-8 pt-6 border-t border-border flex justify-between items-center"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Button
                          variant="outline"
                          onClick={() => {
                            const currentIdx = lesson.chapters.findIndex(c => c.id === selectedChapter);
                            if (currentIdx > 0) {
                              setSelectedChapter(lesson.chapters[currentIdx - 1].id);
                            }
                          }}
                          disabled={lesson.chapters.findIndex(c => c.id === selectedChapter) === 0}
                          className="gap-2"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Previous Chapter
                        </Button>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{lesson.chapters.findIndex(c => c.id === selectedChapter) + 1}</span>
                          <span>of</span>
                          <span>{lesson.chapters.length}</span>
                        </div>
                        
                        <Button
                          onClick={() => {
                            const currentIdx = lesson.chapters.findIndex(c => c.id === selectedChapter);
                            if (currentIdx < lesson.chapters.length - 1) {
                              setSelectedChapter(lesson.chapters[currentIdx + 1].id);
                            } else {
                              navigate("/practice");
                            }
                          }}
                          className="gap-2"
                        >
                          {lesson.chapters.findIndex(c => c.id === selectedChapter) === lesson.chapters.length - 1
                            ? 'Complete & Practice'
                            : 'Next Chapter'}
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="flex items-center justify-center h-[600px] shadow-lg border-dashed">
                    <CardContent className="text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      >
                        <BookOpen className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
                      </motion.div>
                      <h3 className="text-2xl font-semibold mb-3">Select a chapter to begin</h3>
                      <p className="text-muted-foreground text-lg mb-6 max-w-md">
                        Choose a chapter from the sidebar to start your learning journey
                      </p>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Badge variant="secondary" className="text-sm px-3 py-1">
                          {lesson.chapters.length} chapters available
                        </Badge>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonViewer;
