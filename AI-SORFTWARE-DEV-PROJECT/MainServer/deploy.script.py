import os
import time

def run_command(command):
    try:
        print(f"Running command: {command}")
        os.system(command)
    except Exception as e:
        print(f"Error executing command '{command}': {e}")

if __name__ == "__main__":
    # run_command("docker pull postgres")
    # run_command("docker run --name facetrack-db -e POSTGRES_PASSWORD=admin12345 -d -p 5432:5432 postgres")
    # time.sleep(2)
    
    # print('\n##################################### read #######################################')
    # print('\nenter command : "CREATE DATABASE ai_soft_dev;" \nthen enter : "exit" \n')
    # print('##################################### read #######################################\n')
    
    # os.system('docker exec -it facetrack-db psql -U postgres')
    # time.sleep(1)
    
    
    # os.chdir("pythonServer")
    # run_command("docker image build -t facetrack-pyserver-image .")
    # run_command("docker run --name facetrack-pyserver-container -d -p 5001:5001 facetrack-pyserver-image")
    # os.chdir("..")
    
    # os.chdir("backend")
    # run_command("docker image build -t facetrack-backend-image .")
    # run_command("docker run --name facetrack-backend-container -d -p 5000:5000 facetrack-backend-image")
    # os.chdir("..")

    os.chdir("frontend")
    run_command("docker image build -t facetrack-frontend-image .")
    run_command("docker run --name facetrack-frontend-container -d -p 80:80 facetrack-frontend-image")