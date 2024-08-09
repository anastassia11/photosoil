import { motion } from "framer-motion"

export default function MotionWrapper({ children, className }) {

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={className || ''}>
            {children}
        </motion.div>
    )
}
