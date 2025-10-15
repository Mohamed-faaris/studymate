import React from 'react';
import { BookOpen, Lightbulb, HelpCircle, Code, Play, Bug, FileText } from 'lucide-react';

interface AIResponseRendererProps {
  response: any;
}

export function AIResponseRenderer({ response }: AIResponseRendererProps) {
  const { type, content, level } = response;

  switch (type) {
    case 'explain':
      return <ExplanationResponse content={content} level={level} />;
    case 'flashcards':
      return <FlashcardResponse content={content} level={level} />;
    case 'quiz':
      return <QuizResponse content={content} level={level} />;
    case 'flowchart':
      return <FlowchartResponse content={content} level={level} />;
    case 'thought-questions':
      return <ThoughtQuestionsResponse content={content} level={level} />;
    case 'execute-code':
      return <CodeExecutionResponse content={content} level={level} />;
    case 'debug-code':
      return <CodeDebugResponse content={content} level={level} />;
    case 'example-code':
      return <ExampleCodeResponse content={content} level={level} />;
    default:
      return <DefaultResponse content={content} level={level} />;
  }
}

function ExplanationResponse({ content, level }: { content: any; level: string }) {
  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
      <div className="flex items-center mb-2">
        <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
        <span className="text-sm font-medium text-blue-800 uppercase tracking-wide">
          Explanation ({level})
        </span>
      </div>
      <div className="text-blue-900">
        {content.explanation && (
          <div className="mb-3">
            <h4 className="font-semibold mb-1">Explanation:</h4>
            <p className="text-sm leading-relaxed">{content.explanation}</p>
          </div>
        )}
        {content.example && (
          <div>
            <h4 className="font-semibold mb-1">Example:</h4>
            <p className="text-sm leading-relaxed">{content.example}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FlashcardResponse({ content, level }: { content: any; level: string }) {
  const flashcards = content.flashcards || [];

  return (
    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
      <div className="flex items-center mb-3">
        <FileText className="h-5 w-5 text-green-600 mr-2" />
        <span className="text-sm font-medium text-green-800 uppercase tracking-wide">
          Flashcards ({level})
        </span>
      </div>
      <div className="space-y-3">
        {flashcards.map((card: any, index: number) => (
          <div key={index} className="bg-white p-3 rounded-lg border border-green-200">
            <div className="font-medium text-green-900 mb-1">Q: {card.question}</div>
            <div className="text-sm text-green-700">A: {card.answer}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuizResponse({ content, level }: { content: any; level: string }) {
  const quiz = content.quiz || {};

  return (
    <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
      <div className="flex items-center mb-3">
        <HelpCircle className="h-5 w-5 text-purple-600 mr-2" />
        <span className="text-sm font-medium text-purple-800 uppercase tracking-wide">
          Quiz ({level})
        </span>
      </div>
      <div className="bg-white p-4 rounded-lg border border-purple-200">
        <h4 className="font-semibold text-purple-900 mb-2">{quiz.question}</h4>
        <div className="space-y-1">
          {quiz.options?.map((option: string, index: number) => (
            <div key={index} className="text-sm text-purple-700">
              {String.fromCharCode(65 + index)}. {option}
            </div>
          ))}
        </div>
        {quiz.correct_answer && (
          <div className="mt-3 pt-2 border-t border-purple-200">
            <div className="text-sm font-medium text-purple-900">
              Correct Answer: {quiz.correct_answer}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FlowchartResponse({ content, level }: { content: any; level: string }) {
  return (
    <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg">
      <div className="flex items-center mb-2">
        <Lightbulb className="h-5 w-5 text-indigo-600 mr-2" />
        <span className="text-sm font-medium text-indigo-800 uppercase tracking-wide">
          Flowchart ({level})
        </span>
      </div>
      <div className="bg-white p-4 rounded-lg border border-indigo-200">
        <pre className="text-sm text-indigo-900 whitespace-pre-wrap">
          {content.flowchart || 'Flowchart visualization would be displayed here'}
        </pre>
      </div>
    </div>
  );
}

function ThoughtQuestionsResponse({ content, level }: { content: any; level: string }) {
  const questions = content.thought_questions || [];

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
      <div className="flex items-center mb-3">
        <Lightbulb className="h-5 w-5 text-yellow-600 mr-2" />
        <span className="text-sm font-medium text-yellow-800 uppercase tracking-wide">
          Thought Questions ({level})
        </span>
      </div>
      <div className="space-y-2">
        {questions.map((question: string, index: number) => (
          <div key={index} className="bg-white p-3 rounded-lg border border-yellow-200">
            <div className="text-sm text-yellow-900">{question}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CodeExecutionResponse({ content, level }: { content: any; level: string }) {
  return (
    <div className="bg-gray-50 border-l-4 border-gray-500 p-4 rounded-r-lg">
      <div className="flex items-center mb-2">
        <Play className="h-5 w-5 text-gray-600 mr-2" />
        <span className="text-sm font-medium text-gray-800 uppercase tracking-wide">
          Code Execution ({level})
        </span>
      </div>
      <div className="bg-white p-4 rounded-lg border border-gray-200 font-mono text-sm">
        {content.output && (
          <div className="mb-2">
            <div className="text-green-600 font-semibold">Output:</div>
            <pre className="text-gray-900 mt-1">{content.output}</pre>
          </div>
        )}
        {content.error && (
          <div>
            <div className="text-red-600 font-semibold">Error:</div>
            <pre className="text-red-900 mt-1">{content.error}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

function CodeDebugResponse({ content, level }: { content: any; level: string }) {
  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
      <div className="flex items-center mb-2">
        <Bug className="h-5 w-5 text-red-600 mr-2" />
        <span className="text-sm font-medium text-red-800 uppercase tracking-wide">
          Code Debug ({level})
        </span>
      </div>
      <div className="bg-white p-4 rounded-lg border border-red-200">
        <div className="text-sm text-red-900">
          {content.debug_info || 'Debug information would be displayed here'}
        </div>
      </div>
    </div>
  );
}

function ExampleCodeResponse({ content, level }: { content: any; level: string }) {
  return (
    <div className="bg-cyan-50 border-l-4 border-cyan-500 p-4 rounded-r-lg">
      <div className="flex items-center mb-2">
        <Code className="h-5 w-5 text-cyan-600 mr-2" />
        <span className="text-sm font-medium text-cyan-800 uppercase tracking-wide">
          Example Code ({level})
        </span>
      </div>
      <div className="bg-white p-4 rounded-lg border border-cyan-200">
        <pre className="text-sm text-cyan-900 font-mono whitespace-pre-wrap">
          {content.code || 'Example code would be displayed here'}
        </pre>
      </div>
    </div>
  );
}

function DefaultResponse({ content, level }: { content: any; level: string }) {
  return (
    <div className="bg-slate-50 border-l-4 border-slate-500 p-4 rounded-r-lg">
      <div className="flex items-center mb-2">
        <BookOpen className="h-5 w-5 text-slate-600 mr-2" />
        <span className="text-sm font-medium text-slate-800 uppercase tracking-wide">
          Response ({level})
        </span>
      </div>
      <div className="text-slate-900">
        <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(content, null, 2)}</pre>
      </div>
    </div>
  );
}