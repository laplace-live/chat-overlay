import React from 'react'
import { Editor, loader, type EditorProps } from '@monaco-editor/react'
import { cn } from '../../lib/cn'
import { Api } from '../../lib/const'

interface MonacoEditorProps extends Omit<EditorProps, 'height' | 'onChange'> {
  value?: string
  onChange?: (value: string | undefined) => void
  height?: string | number
  className?: string
}

export const MonacoEditor: React.FC<MonacoEditorProps> = ({
  value = '',
  onChange,
  language = 'css',
  theme = 'vs-dark',
  height = '100%',
  className,
  options = {},
  ...props
}) => {
  loader.config({
    paths: { vs: `${Api.Workers}/jsd/monaco-editor@0.52.2/min/vs` },
  })

  const editorOptions = {
    // minimap: { enabled: false },
    fontSize: 14,
    // fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace',
    automaticLayout: true,
    ...options,
  }

  return (
    <div className={cn('relative overflow-hidden rounded-sm border bg-transparent', className)}>
      <Editor
        height={height}
        language={language}
        theme={theme}
        value={value}
        onChange={onChange}
        options={editorOptions}
        {...props}
      />
    </div>
  )
}
