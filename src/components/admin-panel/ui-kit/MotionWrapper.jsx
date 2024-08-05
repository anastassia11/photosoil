import { motion } from "framer-motion"

export default function MotionWrapper({ children }) {

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}>
            {children}
        </motion.div>
    )
}
