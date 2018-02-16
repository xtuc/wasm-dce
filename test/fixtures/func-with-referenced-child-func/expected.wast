(module 
  (func $dontremovefoo
    (nop)
  )
  (func
    (call $dontremovefoo)
  )
)
