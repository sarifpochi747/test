if __name__ == "__main__":
    import os
    try:
        os.system('start cmd /k "python cameraServer.py"')
        os.system('start cmd /k "python predServer.py"')
        
    except Exception as e:
        print(f"app runtime error : {e}")
        raise SystemExit