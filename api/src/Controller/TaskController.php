<?php

namespace App\Controller;

use App\Entity\Task;
use App\Repository\TaskRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[AsController]
#[Route('/api/tasks')]
class TaskController
{
    public function __construct(
        private readonly TaskRepository $repo,
        private readonly EntityManagerInterface $em,
        private readonly SerializerInterface $serializer,
        private readonly ValidatorInterface $validator,
    ) {}

    #[Route('', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $tasks = $this->repo->findBy([], ['createdAt' => 'DESC']);

        return $this->json($tasks);
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $task = new Task();
        $this->applyPayload($task, $request->getContent());

        if ($errors = $this->validate($task)) {
            return new JsonResponse(['errors' => $errors], 400);
        }

        $this->em->persist($task);
        $this->em->flush();

        return $this->json($task, 201);
    }

    #[Route('/{id}', methods: ['GET'], requirements: ['id' => '[0-9a-fA-F-]{36}'])]
    public function show(string $id): JsonResponse
    {
        return $this->json($this->find($id));
    }

    #[Route('/{id}', methods: ['PUT'], requirements: ['id' => '[0-9a-fA-F-]{36}'])]
    public function update(string $id, Request $request): JsonResponse
    {
        $task = $this->find($id);
        $this->applyPayload($task, $request->getContent());

        if ($errors = $this->validate($task)) {
            return new JsonResponse(['errors' => $errors], 400);
        }

        $this->em->flush();

        return $this->json($task);
    }

    #[Route('/{id}/toggle', methods: ['PATCH'], requirements: ['id' => '[0-9a-fA-F-]{36}'])]
    public function toggle(string $id): JsonResponse
    {
        $task = $this->find($id);
        $task->setCompleted(!$task->isCompleted());
        $this->em->flush();

        return $this->json($task);
    }

    #[Route('/{id}', methods: ['DELETE'], requirements: ['id' => '[0-9a-fA-F-]{36}'])]
    public function delete(string $id): Response
    {
        $task = $this->find($id);
        $this->em->remove($task);
        $this->em->flush();

        return new Response(null, 204);
    }

    // ---- helpers ----

    private function find(string $id): Task
    {
        if (!Uuid::isValid($id)) {
            throw new \Symfony\Component\HttpKernel\Exception\NotFoundHttpException();
        }
        $task = $this->repo->find(Uuid::fromString($id));
        if (!$task) {
            throw new \Symfony\Component\HttpKernel\Exception\NotFoundHttpException('Task not found');
        }
        return $task;
    }

    private function applyPayload(Task $task, string $json): void
    {
        if ($json === '') {
            return;
        }
        $this->serializer->deserialize($json, Task::class, 'json', [
            AbstractNormalizer::OBJECT_TO_POPULATE => $task,
            AbstractNormalizer::GROUPS => ['task:write'],
        ]);
    }

    private function validate(Task $task): array
    {
        $errors = $this->validator->validate($task);
        $out = [];
        foreach ($errors as $e) {
            $out[$e->getPropertyPath()] = $e->getMessage();
        }
        return $out;
    }

    private function json(mixed $data, int $status = 200): JsonResponse
    {
        $json = $this->serializer->serialize($data, 'json', [
            AbstractNormalizer::GROUPS => ['task:read'],
        ]);
        return new JsonResponse($json, $status, [], true);
    }
}
