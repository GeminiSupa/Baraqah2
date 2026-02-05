'use client'

import { useState } from 'react'

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
  className?: string
}

const EMOJI_CATEGORIES = {
  '😀': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔'],
  '❤️': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️'],
  '👍': ['👍', '👎', '👊', '✊', '🤛', '🤜', '🤞', '✌️', '🤟', '🤘', '👌', '🤌', '🤏', '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐', '✋', '🖖', '👏', '🙌', '🤲', '🤝', '🙏', '✍️'],
  '😢': ['😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲'],
  '🎉': ['🎉', '🎊', '🎈', '🎁', '🎀', '🎂', '🍰', '🧁', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '☕️', '🍵', '🥤', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹'],
}

export function EmojiPicker({ onEmojiSelect, className = '' }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<keyof typeof EMOJI_CATEGORIES>('😀')

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji)
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-2xl hover:bg-iosGray-6 rounded-ios ios-press"
        aria-label="Open emoji picker"
      >
        😊
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-full right-0 mb-2 z-50 bg-white rounded-ios-xl shadow-ios-xl border border-iosGray-4 p-4 w-80 max-h-96 overflow-hidden flex flex-col">
            {/* Category Tabs */}
            <div className="flex gap-2 mb-3 pb-3 border-b border-iosGray-5 overflow-x-auto">
              {Object.keys(EMOJI_CATEGORIES).map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category as keyof typeof EMOJI_CATEGORIES)}
                  className={`text-2xl px-2 py-1 rounded-ios ios-press flex-shrink-0 ${
                    activeCategory === category ? 'bg-iosBlue/20' : 'hover:bg-iosGray-6'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Emoji Grid */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-8 gap-2">
                {EMOJI_CATEGORIES[activeCategory].map((emoji, index) => (
                  <button
                    key={`${activeCategory}-${index}`}
                    onClick={() => handleEmojiClick(emoji)}
                    className="text-2xl p-2 hover:bg-iosGray-6 rounded-ios ios-press text-center"
                    type="button"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
