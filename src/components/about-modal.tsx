import { IconBrandGithub } from '@tabler/icons-react'
import React, { useEffect, useState } from 'react'

import { Button } from './ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'

interface AboutModalProps {
  isOpen: boolean
  onClose: () => void
}

const REPOSITORY_URL = 'https://github.com/laplace-live/chat-overlay'

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  // State for app version
  const [appVersion, setAppVersion] = useState<string>('')

  // Fetch app version when component mounts
  useEffect(() => {
    window.electronAPI.getAppVersion().then(version => {
      setAppVersion(version)
    })
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className='bg-bg/90'>
        <DialogHeader>
          <DialogTitle>About</DialogTitle>
          <DialogDescription className='sr-only'>About LAPLACE Chat Overlay</DialogDescription>
        </DialogHeader>

        <div className='flex flex-col items-center gap-1 text-center'>
          <h2 className='font-bold text-lg'>LAPLACE Chat Overlay</h2>
          <p className='text-fg/60 text-sm'>
            Version <span className='select-text'>{appVersion}</span>
          </p>
          <p className='text-fg text-sm text-pretty'>
            A modern, transparent chat overlay application for Bilibili live powered by LAPLACE Event Bridge or LEF
            Bridge Mode
          </p>
        </div>

        <div className='flex justify-center'>
          <Button variant='outline' type='button' onClick={() => window.electronAPI.openExternal(REPOSITORY_URL)}>
            <IconBrandGithub />
            View on GitHub
          </Button>
        </div>

        <DialogFooter className='text-center'>
          <div className='text-fg/50 text-xs'>Tech otakus destroy the world</div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
