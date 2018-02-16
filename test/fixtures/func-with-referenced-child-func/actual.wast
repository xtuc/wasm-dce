(module
  (func $dontremovefoo
    (nop)
  )
  (func (export "test")
    (call $dontremovefoo)
  )
  (func
    (call $dontremovefoo)
  )
)
