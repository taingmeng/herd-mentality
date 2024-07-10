import { useEffect } from "react";

interface ModalProps {
  onClose?: () => void;
  children?: any;
  className?: string;
  disabled?: boolean;
  visible?: boolean;
  title?: string;
  confirmButtonText?: string;
  declineButtonText?: string;
  onConfirm?: () => void;
  onDecline?: () => void;
}



export function Modal({ visible, onClose, title, children, className, disabled,
  confirmButtonText, onConfirm, declineButtonText, onDecline
 }: ModalProps) {
  useEffect(() => {
    const html = document.getElementsByTagName('html')[0]
  
    if (visible) {
      html.classList.add('lock-scroll')
    } else {
      html.classList.remove('lock-scroll')
    }
    return (): void => {
      html.classList.remove('lock-scroll')
    }
  }, [visible])
  return (
    <div id="default-modal" className={`${visible ? "" : "hidden"} overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full md:inset-0 h-[calc(100%)] max-h-full bg-gray-900/75 overscroll-none`}>
    <div className="relative p-4 w-full max-w-2xl max-h-full">
        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {title}
                </h3>
                <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="default-modal"
                 onClick={onClose}>
                    <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                    </svg>
                    <span className="sr-only">Close modal</span>
                </button>
            </div>
            <div className="p-4 md:p-5 space-y-4">
                {children}
            </div>
            <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
                {confirmButtonText && <button onClick={onConfirm || onClose} data-modal-hide="default-modal" type="button" className="text-white bg-pink-700 hover:bg-pink-800 focus:ring-4 focus:outline-none focus:ring-pink-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-pink-600 dark:hover:bg-pink-700 dark:focus:ring-pink-800">{confirmButtonText}</button>}
                
                {declineButtonText && <button  onClick={onDecline} data-modal-hide="default-modal" type="button" className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">{declineButtonText}</button>}
            </div>
        </div>
    </div>
</div>
  );
}

export default Modal;
